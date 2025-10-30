<script>
  import { onMount } from 'svelte';
  import { jsPDF } from 'jspdf';
  import 'jspdf-autotable';
  import { PUBLIC_API_URL } from '$env/static/public';
  import { myFetch } from '$lib/utils/myFetch';

  import estoreData from '$lib/stores/estore';

  let estore;
  $: estore = $estoreData;

  export let orderId;
  let isLoading = false;

  async function generateInvoice() {
    try {
      isLoading = true;
      const [orderData, orderItemsData] = await Promise.all([
        myFetch(`${PUBLIC_API_URL}/order/orders/${orderId}/`),
        myFetch(`${PUBLIC_API_URL}/order/order-items/?order_id=${orderId}`)
      ]);
      
      const rupeeSymbol = 'INR';

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.setProperties({
        title: `Invoice KB-${orderId}`,
        subject: 'Invoice',
        author: estore?.name || '',
        creator: 'Invoice Generator'
      });
      
      // Function to draw page border and header on each page
      function drawPageHeaderAndBorder(isFirstPage = false) {
        // Draw page border
        doc.setDrawColor(100, 100, 100);
        if (pageWidth > 20 && pageHeight > 20) {
          doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        }
        
        // Only draw header on first page
        if (isFirstPage) {
          doc.setFontSize(22);
          doc.setTextColor(71, 52, 3);
          doc.text('INVOICE', pageWidth / 2, 25, { align: 'center' });
          
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(estore?.name || '', 20, 40);

          const address = (estore?.address.line1 || '') + '\n' +
                          (estore?.address.line2 || '') + '\n' +
                          (estore?.address.city || '') + ', ' +
                          (estore?.address.state || '') + ' ' +
                          (estore?.address.pine || '');
          const addressLines = doc.splitTextToSize(address, pageWidth - 40);
          doc.text(addressLines, 20, 45);
          
          const contactY = 45 + (addressLines.length * 5);
          doc.text(`Phone: ${estore?.mobile || ''} | Email: ${estore?.email || ''}`, 20, contactY);
          
          return contactY;
        }
        
        return 25; // Return a smaller Y position for non-first pages
      }
      
      // Draw first page header
      const contactY = drawPageHeaderAndBorder(true);

      const invoiceBoxY = contactY + 10;
      doc.setFillColor(245, 230, 200);
      // Validate dimensions before drawing rectangles
      if (pageWidth > 40) {
        doc.rect(20, invoiceBoxY, pageWidth - 40, 15, 'F');
        doc.setDrawColor(0);
        doc.rect(20, invoiceBoxY, pageWidth - 40, 15);
      }
      doc.text(`Invoice #: KB-${orderData.id || 'N/A'}`, 25, invoiceBoxY + 10);
      doc.text(`Date: ${orderData.created ? new Date(orderData.created).toLocaleDateString('en-IN') : 'N/A'}`, pageWidth - 25, invoiceBoxY + 10, { align: 'right' });

      const addressBoxY = invoiceBoxY + 25;
      doc.setFontSize(10);
      doc.setDrawColor(0);
      
      const boxWidth = (pageWidth - 40 - 10) / 2;
      
      function drawBox(x, y, width, height, headerText) {
        // Validate all dimensions before drawing
        if (typeof x !== 'number' || typeof y !== 'number' || 
            typeof width !== 'number' || typeof height !== 'number' ||
            width <= 0 || height <= 0) {
          console.warn('Invalid dimensions for drawBox:', { x, y, width, height });
          return;
        }

        doc.setDrawColor(0);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, width, height, 0, 0, 'FD');
        doc.setFillColor(245, 245, 245);
        doc.rect(x, y, width, 6, 'F');
        doc.setDrawColor(0);
        doc.line(x, y, x + width, y);
        doc.line(x + width, y, x + width, y + height);
        doc.line(x, y + height, x + width, y + height);
        doc.line(x, y, x, y + height);
        doc.text(headerText, x + 5, y + 4);
      }

      drawBox(20, addressBoxY, boxWidth, 35, 'BILL TO:');
      const billName = `${orderData.user?.first_name || ''} ${orderData.user?.last_name || ''}`.trim() || 'N/A';
      const billEmail = orderData.user?.email || 'N/A';
      const billPhone = orderData.user?.mobile || 'N/A';
      doc.text(billName, 25, addressBoxY + 12);
      doc.text(billEmail, 25, addressBoxY + 19);
      doc.text(billPhone, 25, addressBoxY + 26);

      const shippingBoxX = 20 + boxWidth + 10;
      drawBox(shippingBoxX, addressBoxY, boxWidth, 35, 'SHIP TO:');
      const address_data = orderData.shipping_address || {};
      const shipName = address_data.name || 'N/A';
      let shipAddressLine1 = address_data.address?.line1 || 'N/A';
      let shipAddressLine2 = address_data.address?.line2 || '';
      let shipCity = `${address_data.address?.city || ''}, ${address_data.address?.state || ''} - ${address_data.address?.pin || ''}`.trim() || 'N/A';
      const maxLineWidth = boxWidth - 10;
      doc.text(shipName, shippingBoxX + 5, addressBoxY + 12);
      const wrappedLine1 = doc.splitTextToSize(shipAddressLine1, maxLineWidth);
      doc.text(wrappedLine1, shippingBoxX + 5, addressBoxY + 19);
      let currentY = addressBoxY + 19 + (wrappedLine1.length * 5);
      if (shipAddressLine2) {
        const wrappedLine2 = doc.splitTextToSize(shipAddressLine2, maxLineWidth);
        doc.text(wrappedLine2, shippingBoxX + 5, currentY);
        currentY += wrappedLine2.length * 5;
      }
      if (shipCity) {
        const wrappedCity = doc.splitTextToSize(shipCity, maxLineWidth);
        doc.text(wrappedCity, shippingBoxX + 5, currentY);
      }

      const tableStartY = addressBoxY + 45;
      
      let grandTotal = 0;
      let totalCGST = 0;
      let totalSGST = 0;
      let totalIGST = 0;
      
      const tableRows = (orderItemsData.results || []).map(item => {
        const product = item.product_listing || {};
        const quantity = item.quantity || 0;
        const originalSubtotal = item.subtotal || 0;

        // Apply order-level discount proportionally to each item
        const totalOrderSubtotal = (orderItemsData.results || []).reduce((sum, i) => sum + (i.subtotal || 0), 0);
        const itemDiscount = orderData.total_discount * (originalSubtotal / totalOrderSubtotal);
        const discountedSubtotal = originalSubtotal - itemDiscount;

        // Tax rates
        const cgstRate = product.cgst_rate || 0;
        const sgstRate = product.sgst_rate || 0;
        const igstRate = product.igst_rate || 0;
        const totalTaxRate = (cgstRate + sgstRate + igstRate) / 100;

        // Calculate base price (excluding taxes) based on discounted subtotal
        const baseSubtotal = discountedSubtotal / (1 + totalTaxRate);
        const baseUnitPrice = baseSubtotal / quantity;

        // Calculate taxes per unit
        const cgstAmount = baseUnitPrice * (cgstRate / 100);
        const sgstAmount = baseUnitPrice * (sgstRate / 100);
        const igstAmount = baseUnitPrice * (igstRate / 100);

        // Total with taxes
        const totalTaxesPerUnit = cgstAmount + sgstAmount + igstAmount;
        const totalUnitPriceWithTax = baseUnitPrice + totalTaxesPerUnit;
        const itemTotalWithTax = totalUnitPriceWithTax * quantity;

        // Accumulate totals
        totalCGST += cgstAmount * quantity;
        totalSGST += sgstAmount * quantity;
        totalIGST += igstAmount * quantity;
        grandTotal += originalSubtotal;

        // Format tax display
        let taxDisplay = '';
        if (cgstRate > 0) taxDisplay += `CGST@${cgstRate}%: ${rupeeSymbol}${cgstAmount.toFixed(2)}\n`;
        if (sgstRate > 0) taxDisplay += `SGST@${sgstRate}%: ${rupeeSymbol}${sgstAmount.toFixed(2)}\n`;
        if (igstRate > 0) taxDisplay += `IGST@${igstRate}%: ${rupeeSymbol}${igstAmount.toFixed(2)}`;

        return {
          description: product.name || 'N/A',
          qty: quantity,
          unitPrice: `${rupeeSymbol}${baseUnitPrice.toFixed(2)}`,
          tax: taxDisplay.trim() || 'N/A',
          total: `${rupeeSymbol}${itemTotalWithTax.toFixed(2)}`
        };
      });

      const discountedGrandTotal = grandTotal - (orderData.total_discount || 0);
      const finalAmountWithTax = discountedGrandTotal;

      // Manually wrap long labels for the totals table
      const totalsTable = [];
      totalsTable.push(['SUBTOTAL:', `${rupeeSymbol}${grandTotal.toFixed(2)}`]);
      if (orderData.offer) {
        totalsTable.push(['OFFER APPLIED:', `-${rupeeSymbol}${orderData.discount_amount_offer.toFixed(2)}`]);
        const offerLabel = `${orderData.offer.name} (${orderData.offer.get_discount_percent}% OFF)`;
        const wrappedOfferLabel = doc.splitTextToSize(offerLabel, 140);
        totalsTable.push([wrappedOfferLabel, '']);
      }
      if (orderData.total_discount > 0) {
        totalsTable.push(['TOTAL SAVINGS:', `-${rupeeSymbol}${orderData.total_discount.toFixed(2)}`]);
        totalsTable.push(['SUBTOTAL AFTER DISCOUNT:', `${rupeeSymbol}${discountedGrandTotal.toFixed(2)}`]);
      }
      if (totalCGST > 0) totalsTable.push(['CGST:', `${rupeeSymbol}${totalCGST.toFixed(2)}`]);
      if (totalSGST > 0) totalsTable.push(['SGST:', `${rupeeSymbol}${totalSGST.toFixed(2)}`]);
      if (totalIGST > 0) totalsTable.push(['IGST:', `${rupeeSymbol}${totalIGST.toFixed(2)}`]);
      totalsTable.push(['FINAL AMOUNT:', `${rupeeSymbol}${finalAmountWithTax.toFixed(2)}`]);
      totalsTable.push(['PAYMENT STATUS:', orderData.payment_status.toUpperCase()]);

      const tableColumns = [
        { header: 'Description', dataKey: 'description' },
        { header: 'Qty', dataKey: 'qty' },
        { header: 'Unit Price', dataKey: 'unitPrice' },
        { header: 'Tax', dataKey: 'tax' },
        { header: 'Total', dataKey: 'total' }
      ];

      // Calculate available height for the table on the first page
      const availableHeight = pageHeight - tableStartY - 20; // 20px margin at bottom
      
      // Set up table with pagination support
      doc.autoTable({
        startY: tableStartY,
        columns: tableColumns,
        body: tableRows,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
          textColor: [40, 40, 40],
          valign: 'middle',
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [71, 52, 3],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: { top: 5, right: 3, bottom: 5, left: 3 }
        },
        columnStyles: {
          description: { cellWidth: 'auto', halign: 'left' },
          qty: { cellWidth: 15, halign: 'center' },
          unitPrice: { cellWidth: 30, halign: 'right' },
          tax: { cellWidth: 50, halign: 'left' },
          total: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: 20, right: 20 },
        tableWidth: pageWidth - 40,
        didDrawPage: (data) => {
          // Draw only border on subsequent pages
          drawPageHeaderAndBorder(false);
          
          // Add page number at the bottom
          const pageNumber = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(`Page ${pageNumber}`, pageWidth - 20, pageHeight - 15, { align: 'right' });
          
          // Add table header on each new page
          if (data.pageCount > 1) {
            doc.autoTable.previous.finalY = 30; // Adjust Y position for subsequent pages
          }
        },
        // Handle table split across pages
        willDrawCell: (data) => {
          // Ensure tax information doesn't get cut off between pages
          if (data.column.dataKey === 'tax' && data.cell.text.length > 1) {
            const remainingHeight = data.settings.pageBreakHeight - data.cursor.y;
            const requiredHeight = data.row.height;
            
            if (requiredHeight > remainingHeight && remainingHeight < 20) {
              data.cursor.y = data.settings.pageBreakHeight + 1; // Force page break
            }
          }
        }
      });

      const finalY = doc.lastAutoTable.finalY + 5;
      
      // Check if we need to add a page for totals
      const totalsHeight = totalsTable.length * 12 + 20; // Estimate height needed for totals
      if (finalY + totalsHeight > pageHeight - 40) {
        doc.addPage();
        drawPageHeaderAndBorder(false);
        doc.setFontSize(14);
        doc.text('Invoice Summary', pageWidth / 2, 30, { align: 'center' });
        doc.lastAutoTable.finalY = 40;
      }
      
      // Create the totals table with proper alignment
      // Adjust the table dimensions and position
      const valueColumnWidth = 40; // Width of the right column (values)
      const labelColumnWidth = 60; // Width of the left column (labels)
      const tableWidth = valueColumnWidth + labelColumnWidth;
      const tableX = pageWidth - tableWidth - 20; // Position the table more to the right
      
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 5,
        body: totalsTable,
        theme: 'plain',
        styles: {
          fontSize: 10,
          cellPadding: { top: 2, bottom: 2 },
          valign: 'middle',
          fontStyle: 'normal',
          lineWidth: 0.1,
          minCellHeight: 8,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { 
            cellWidth: labelColumnWidth, 
            halign: 'right',
            fontStyle: 'bold',
            cellPadding: { right: 5, left: 0 }
          },
          1: { 
            cellWidth: valueColumnWidth, 
            halign: 'right', 
            cellPadding: { right: 5, left: 0 } 
          }
        },
        margin: { left: tableX },
        didParseCell: function(data) {
          if (data.column.index === 1 && data.cell.text[0] && data.cell.text[0].startsWith('-')) {
            data.cell.styles.textColor = [220, 53, 69];
          }
        },
        willDrawCell: function(data) {
          if (data.row.index % 2 === 0) {
            data.cell.styles.fillColor = [250, 250, 250];
          }
        }
      });

      const finalTableY = doc.lastAutoTable.finalY;
      const tableHeight = finalTableY - doc.lastAutoTable.startY;
      
      // Draw the border around the totals table
      doc.setDrawColor(200, 200, 200);
      const rectX = tableX || 0;
      const rectY = (doc.lastAutoTable.startY - 2) || 0;
      const rectWidth = tableWidth || 0;
      const rectHeight = ((tableHeight + 4) || 0);

      // Only draw the rect if we have valid dimensions
      if (rectWidth > 0 && rectHeight > 0) {
        doc.rect(rectX, rectY, rectWidth, rectHeight);
      }

      const footerY = finalTableY + 15;
      doc.setFontSize(9);
      doc.text('Terms & Conditions:', 20, footerY);
      doc.text('1. This is a computer generated invoice', 20, footerY + 5);
      doc.text('2. Goods once sold will not be taken back', 20, footerY + 10);
      doc.text('3. All disputes subject to Mumbai jurisdiction', 20, footerY + 15);

      doc.setFontSize(10);
      doc.text('Authorized Signature', pageWidth - 25, footerY + 25, { align: 'right' });
      doc.line(pageWidth - 65, footerY + 30, pageWidth - 25, footerY + 30);
      
      // Add final page number
      const pageNumber = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(`Page ${pageNumber} of ${pageNumber}`, pageWidth - 20, pageHeight - 15, { align: 'right' });

      doc.save(`invoice-kb-${orderData.id || 'N/A'}.pdf`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice. Please try again.');
    } finally {
      isLoading = false;
    }
  }
</script>

<button 
  class="text-red-500 hover:text-red-600 inline-flex items-center gap-2" 
  on:click={generateInvoice}
  disabled={isLoading}
>
  {#if isLoading}
    <div class="flex items-center gap-2">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Generating Invoice...
    </div>
  {:else}
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" />
    </svg>
    Download Invoice
  {/if}
</button>

<style>
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>
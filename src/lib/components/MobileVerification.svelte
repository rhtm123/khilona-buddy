<script>
    import { onMount, onDestroy } from 'svelte';
    import { PUBLIC_API_URL } from '$env/static/public';
    import { myFetch } from '$lib/utils/myFetch';
    import { user,updateUser } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import { addAlert } from '$lib/stores/alert';
    export let redirectAfterVerification = '/';
    
    let mobile = '';
    let otp = '';
    let otpSent = false;
    let isVerifying = false;
    let isSendingOtp = false;
    let errorMessage = '';
    let successMessage = '';
    let timeLeft = 60;
    let canResend = false;
    let timer;
    let otpDigits = ['', '', '', '', '', ''];

    let authUser = $user;
    
    // Auto-fill mobile if available in user store
    onMount(() => {
      const unsubscribe = user.subscribe(userData => {
        if (userData && userData.mobile) {
          mobile = userData.mobile;
        }
      });
      
      return () => {
        unsubscribe();
        clearInterval(timer);
      };
    });
    
    // Handle OTP input
    function handleOtpInput(index, event) {
      const value = event.target.value;
      
      // Only allow numbers
      if (!/^\d*$/.test(value)) {
        event.target.value = otpDigits[index];
        return;
      }
      
      // Update the digit
      otpDigits[index] = value.slice(-1);
      
      // Move to next input if value is entered
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
      
      // Combine all digits
      otp = otpDigits.join('');
    }
    
    // Handle backspace in OTP input
    function handleKeyDown(index, event) {
      if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
        // Move to previous input on backspace if current input is empty
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
          // Clear the previous input
          otpDigits[index - 1] = '';
          otp = otpDigits.join('');
        }
      }
    }
    
    // Start countdown timer
    function startTimer() {
      timeLeft = 60;
      canResend = false;
      
      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          clearInterval(timer);
          canResend = true;
        }
      }, 1000);
    }
    
    // Send OTP
    async function sendOtp() {
      
      if (!mobile || mobile.length < 10) {
        errorMessage = 'Please enter a valid mobile number';
        return;
      }
      
      errorMessage = '';
      successMessage = '';
      isSendingOtp = true;


      let url = `${PUBLIC_API_URL}/user/users/${authUser.user_id}/`;

      let userData = await myFetch(url, "PUT", {"mobile": mobile}, authUser.access_token);
      authUser['mobile'] = userData?.mobile;
      // console.log(userData);
      user.set(authUser);
      
      try {
        fetch(`${PUBLIC_API_URL}/user/send-otp/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile })
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data.message) {
                otpSent = true;
                successMessage = 'OTP sent to your WhatsApp number';
                startTimer();
            } else {
                errorMessage = data.message || 'Failed to send OTP. Please try again.';
            }
        });
        
      } catch (error) {
        console.error('Error sending OTP:', error);
        errorMessage = 'Failed to connect to the server. Please try again.';
      } finally {
        isSendingOtp = false;
      }
    }
    
    // Verify OTP
    async function verifyOtp() {
      if (!otp || otp.length !== 6) {
        errorMessage = 'Please enter a valid 6-digit OTP';
        return;
      }
      
      errorMessage = '';
      successMessage = '';
      isVerifying = true;
      
      try {
        console.log(mobile, otp);
        fetch(`${PUBLIC_API_URL}/user/verify-otp/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile, otp })
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            if (data.message) {
                successMessage = 'Mobile number verified successfully!';

                addAlert("Mobile number verified successfully", "success")
                
          // Update user store with verified mobile
          updateUser({ mobile_verified: true });
          
          // Redirect after a short delay
        //   setTimeout(() => {
            goto(redirectAfterVerification);
        //   }, 1500);
        } else {
                errorMessage = data.message || 'Invalid OTP. Please try again.';
            }
        });
        
      } catch (error) {
        console.error('Error verifying OTP:', error);
        errorMessage = 'Failed to connect to the server. Please try again.';
      } finally {
        isVerifying = false;
      }
    }
    
    // Cleanup on component destroy
    onDestroy(() => {
      clearInterval(timer);
    });
  </script>
  
  <div class="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Verify Your Mobile</h2>
      <p class="text-gray-600 mt-2">We'll send a verification code to your WhatsApp number</p>
    </div>
    
    {#if errorMessage}
      <div class="alert alert-error mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{errorMessage}</span>
      </div>
    {/if}
    
    {#if successMessage}
      <div class="alert alert-success mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{successMessage}</span>
      </div>
    {/if}
    
    {#if !otpSent}
      <!-- Mobile Number Input -->
      <div class="form-control">
        <label class="label">
          <span class="label-text">Mobile Number</span>
        </label>
        <div class="input-group">
          <span class="bg-base-200 px-3 py-2 text-gray-600 rounded-l-lg border border-r-0 border-gray-300">+91</span>
          <input 
            type="tel" 
            bind:value={mobile} 
            placeholder="Enter your 10-digit mobile number" 
            class="input input-bordered w-full" 
            maxlength="10"
            pattern="[0-9]{10}"
          />
        </div>
        <label class="label">
          <span class="label-text-alt text-gray-500">We'll send the verification code to this number</span>
        </label>
      </div>
      
      <button 
        class="btn btn-primary w-full mt-4" 
        on:click={sendOtp} 
        disabled={isSendingOtp || !mobile || mobile.length !== 10}
      >
        {#if isSendingOtp}
          <span class="loading loading-spinner loading-sm"></span>
          Sending OTP...
        {:else}
          Send Verification Code
        {/if}
      </button>
    {:else}
      <!-- OTP Input -->
      <div class="form-control">
        <label class="label">
          <span class="label-text">Enter Verification Code</span>
        </label>
        <div class="flex justify-between gap-2 mb-2">
          {#each Array(6) as _, i}
            <input 
              id={`otp-${i}`}
              type="text" 
              maxlength="1"
              inputmode="numeric"
              class="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
              value={otpDigits[i]}
              on:input={(e) => handleOtpInput(i, e)}
              on:keydown={(e) => handleKeyDown(i, e)}
            />
          {/each}
        </div>
        <label class="label">
          <span class="label-text-alt text-gray-500">Enter the 6-digit code sent to your WhatsApp</span>
        </label>
      </div>
      
      <div class="flex flex-col gap-3 mt-4">
        <button 
          class="btn btn-primary" 
          on:click={verifyOtp} 
          disabled={isVerifying || otp.length !== 6}
        >
          {#if isVerifying}
            <span class="loading loading-spinner loading-sm"></span>
            Verifying...
          {:else}
            Verify
          {/if}
        </button>
        
        <div class="text-center">
          {#if !canResend}
            <p class="text-sm text-gray-600">Resend code in {timeLeft} seconds</p>
          {:else}
            <button 
              class="btn btn-ghost btn-sm text-primary" 
              on:click={sendOtp} 
              disabled={isSendingOtp}
            >
              {#if isSendingOtp}
                <span class="loading loading-spinner loading-xs"></span>
                Sending...
              {:else}
                Resend Code
              {/if}
            </button>
          {/if}
        </div>
      </div>
    {/if}
    
    <div class="mt-6 text-center">
      <div class="flex items-center justify-center gap-2 text-sm text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
        <span>Your information is secure and encrypted</span>
      </div>
    </div>
  </div>
  
  <style>
    /* Focus styles for OTP inputs */
    input:focus {
      outline: none;
    }
    
    /* Animation for OTP input */
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    input.focus {
      animation: pulse 0.3s ease-in-out;
    }
  </style>
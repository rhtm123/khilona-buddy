<script>
    export let firstName = '';
    export let lastName = '';
    export let size = '10'

    // Get initials from first and last name
    $: initials = (firstName?.[0] || '') + (lastName?.[0] || '');
    
    // Generate unique colors based on initials
    function generateColors(str) {
        // Generate first hash
        let hash1 = 0;
        // Generate second hash for different color
        let hash2 = 0;
        for (let i = 0; i < str.length; i++) {
            hash1 = str.charCodeAt(i) + ((hash1 << 5) - hash1);
            hash2 = str.charCodeAt(i) + ((hash2 << 7) - hash2);
        }

        // Convert to HSL colors with good saturation and lightness
        const hue1 = Math.abs(hash1 % 360);
        const hue2 = Math.abs(hash2 % 360);
        
        return {
            color1: `hsl(${hue1}, 70%, 60%)`,
            color2: `hsl(${hue2}, 70%, 50%)`
        };
    }

    $: colors = generateColors(initials);
    $: style = `background: linear-gradient(135deg, ${colors.color1}, ${colors.color2})`;
</script>

<div class="w-{size} h-{size} rounded-full flex items-center justify-center text-white" {style}>
    <span class="font-medium text-lg">{initials.toUpperCase()}</span>
</div>
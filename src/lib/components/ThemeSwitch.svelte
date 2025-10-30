<script>
  function setTheme(name) {
    localStorage.setItem("selectedTheme", name);
    const themes = JSON.parse(localStorage.getItem("themes") || "{}");
    const theme = themes[name];
    if (theme) {
      for (const key in theme) {
        document.documentElement.style.setProperty(key, theme[key]);
      }
    }
  }
</script>

<button on:click={() => setTheme("light")}>Light</button>
<button on:click={() => setTheme("dark")}>Dark</button>
<button on:click={() => setTheme("custom1")}>Custom 1</button>

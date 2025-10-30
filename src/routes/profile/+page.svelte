<script>
  import { user } from "$lib/stores/auth";
  let authUser;

  user.subscribe(value => {
    authUser = value;
  });
</script>

<!-- This page intentionally left empty as the layout will handle the profile home view --> 
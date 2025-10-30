<script>
  import { fade, slide } from 'svelte/transition';
  
  export let comments = [];
  let newComment = '';
  let replyingTo = null;
  let newReply = '';

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function handleComment() {
    // TODO: Implement comment submission
    newComment = '';
  }

  function handleReply(commentId) {
    // TODO: Implement reply submission
    replyingTo = null;
    newReply = '';
  }

  function handleLike(type, id) {
    // TODO: Implement like functionality
  }
</script>

<div class="comments-section mt-16">
  <h2 class="text-2xl font-bold mb-8">Comments ({comments.length})</h2>

  <!-- New Comment Form -->
  <div class="mb-8">
    <div class="flex gap-4">
      <div class="avatar">
        <div class="w-12 h-12 rounded-full bg-gray-200">
          <img src="/img/Toy-Names-For-Kids.webp" alt="User" />
        </div>
      </div>
      <div class="flex-1">
        <textarea
          bind:value={newComment}
          class="textarea textarea-primary bg-white textarea-bordered w-full"
          rows="3"
          placeholder="Write a comment..."
        ></textarea>
        <button 
          class="btn btn-primary mt-2"
          disabled={!newComment}
          on:click={handleComment}
        >
          Post Comment
        </button>
      </div>
    </div>
  </div>

  <!-- Comments List -->
  <div class="space-y-8">
    {#each comments as comment (comment.id)}
      <div class="comment" in:fade>
        <!-- Comment -->
        <div class="flex gap-4">
          <div class="avatar">
            <div class="w-12 h-12 rounded-full">
              <img src={comment.user.avatar} alt={comment.user.name} />
            </div>
          </div>
          <div class="flex-1">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <div>
                  <h4 class="font-semibold">{comment.user.name}</h4>
                  <span class="text-sm text-gray-500">{comment.user.role}</span>
                </div>
                <span class="text-sm text-gray-500">{formatDate(comment.date)}</span>
              </div>
              <p class="text-gray-700">{comment.content}</p>
            </div>
            <div class="flex items-center gap-6 mt-2 ml-4">
              <button 
                class="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                on:click={() => handleLike('comment', comment.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                {comment.likes}
              </button>
              <button 
                class="text-sm text-gray-500 hover:text-primary"
                on:click={() => replyingTo = replyingTo === comment.id ? null : comment.id}
              >
                Reply
              </button>
            </div>

            <!-- Reply Form -->
            {#if replyingTo === comment.id}
              <div class="ml-4 mt-4" transition:slide>
                <div class="flex gap-4">
                  <div class="avatar">
                    <div class="w-8 h-8 rounded-full bg-gray-200">
                      <img src="/img/Toy-Names-For-Kids.webp" alt="User" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <textarea
                      bind:value={newReply}
                      class="textarea textarea-bordered w-full"
                      rows="2"
                      placeholder="Write a reply..."
                    ></textarea>
                    <div class="flex justify-end gap-2 mt-2">
                      <button 
                        class="btn btn-sm btn-ghost"
                        on:click={() => replyingTo = null}
                      >
                        Cancel
                      </button>
                      <button 
                        class="btn btn-sm btn-primary"
                        disabled={!newReply}
                        on:click={() => handleReply(comment.id)}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            {/if}

            <!-- Replies -->
            {#if comment.replies && comment.replies.length > 0}
              <div class="ml-12 mt-4 space-y-4">
                {#each comment.replies as reply (reply.id)}
                  <div class="flex gap-4" in:fade>
                    <div class="avatar">
                      <div class="w-8 h-8 rounded-full">
                        <img src={reply.user.avatar} alt={reply.user.name} />
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="bg-gray-50 rounded-lg p-3">
                        <div class="flex items-center justify-between mb-2">
                          <div>
                            <h4 class="font-semibold">{reply.user.name}</h4>
                            <span class="text-sm text-gray-500">{reply.user.role}</span>
                          </div>
                          <span class="text-sm text-gray-500">{formatDate(reply.date)}</span>
                        </div>
                        <p class="text-gray-700">{reply.content}</p>
                      </div>
                      <div class="flex items-center gap-6 mt-2 ml-4">
                        <button 
                          class="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                          on:click={() => handleLike('reply', reply.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          {reply.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div> 
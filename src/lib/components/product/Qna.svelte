<script>

export let product_listing;
import { onMount } from "svelte";
import { user } from '$lib/stores/auth.js';
import { PUBLIC_API_URL } from '$env/static/public';
import { myFetch } from "$lib/utils/myFetch";



onMount(async () => {
    // Subscribe to user store
    const unsubscribe = user.subscribe(value => {
      if (value) {
        currentUser = value;
        userId = value.user_id;
        // Set role based on entity field
        userRole = value.entity ? 'seller' : 'buyer';
        console.log("User data:", { userId, userRole, entity: value.entity });
        checkPurchaseHistory();
      } else {
        currentUser = null;
        userId = null;
        userRole = null;
        hasPurchased = false;
      }
    });

    fetchQuestions();



    // Cleanup subscription on component destroy
    return () => {
      unsubscribe();
    };
  });

let questions = [];
  let questionsLoading = false;
  let questionsNext = null;
  let questionsLoaded = false;
  let newQuestion = '';
  let newAnswer = {};
  let userRole = null;
  let userId = null;
  let hasPurchased = false;
  let currentUser = null;



  // Fetch questions
  async function fetchQuestions() {
    if (questionsLoaded) return;
    questionsLoading = true;
    try {
      let url = `${PUBLIC_API_URL}/qna/questions/?product_listing_id=${product_listing.id}&ordering=-id&answers_required=true`;
      let data = await myFetch(url, 'GET', {}, currentUser?.access_token);
      questions = data.results;
      questionsNext = data.next;
      questionsLoaded = true;
      console.log("questions",questions);
    } catch (e) {
      console.error("Error fetching questions:", e);
    } finally {
      questionsLoading = false;
    }
  }

  // Check if user has purchased the product
  async function checkPurchaseHistory() {
    if (!userId) return;
    try {
      // First get user's orders
      const ordersResponse = await myFetch(
        `${PUBLIC_API_URL}/order/orders?user_id=${userId}`,
        'GET',
        {},
        currentUser?.access_token
      );
      
      // Get all order IDs
      const orderIds = ordersResponse.results.map(order => order.id);
      
      // If there are orders, check order items
      if (orderIds.length > 0) {
        const orderItemsResponse = await myFetch(
          `${PUBLIC_API_URL}/order/order-items/?page=1&page_size=100&need_reviews=true`,
          'GET',
          {},
          currentUser?.access_token
        );
        
        // Check if any order item matches the current product
        hasPurchased = orderItemsResponse.results.some(item => 
          orderIds.includes(item.order_id) && 
          item.product_listing.id === product_listing.id &&
          ['delivered', 'ready_for_delivery'].includes(item.status)
        );
      }
    } catch (e) {
      console.error("Error checking purchase history:", e);
    }
  }

  // Submit new question
  async function submitQuestion() {
    if (!userId) {
      goto('/login');
      return;
    }
    if (!newQuestion.trim()) return;

    try {
      const response = await myFetch(
        `${PUBLIC_API_URL}/qna/questions/`, 
        'POST',
        {
          question_text: newQuestion,
          user_id: userId,
          product_listing_id: product_listing.id
        },
        currentUser?.access_token
      );
      
      if (response) {
        newQuestion = '';
        questionsLoaded = false;
        fetchQuestions();
      }
    } catch (e) {
      console.error("Error submitting question:", e);
    }
  }

  // Submit new answer
  async function submitAnswer(questionId) {
    if (!userId) {
      goto('/login');
      return;
    }
    if (!newAnswer[questionId]?.trim()) return;

    try {
      const response = await myFetch(
        `${PUBLIC_API_URL}/qna/answers/`,
        'POST',
        {
          answer_text: newAnswer[questionId],
          user_id: userId,
          question_id: questionId
        },
        currentUser?.access_token
      );
      console.log("response",response);
      
      if (response) {
        newAnswer[questionId] = '';
        questionsLoaded = false;
        fetchQuestions();
      }
    } catch (e) {
      console.error("Error submitting answer:", e);
    }
  }


</script>


<div class="max-w-3xl mx-auto space-y-6">
    <!-- Question Input -->
    <div class="bg-white rounded-lg shadow-sm border p-4">
      <h3 class="text-lg font-medium mb-3">Ask a Question</h3>
      <div class="flex gap-3">
        <textarea
          bind:value={newQuestion}
          placeholder="Type your question here..."
          class="textarea textarea-bordered w-full  resize-none text-sm focus:ring-2 focus:ring-primary/20"
          disabled={questionsLoading}
        ></textarea>
        <button
          on:click={submitQuestion}
          class="btn btn-primary px-6 h-auto"
          disabled={questionsLoading || !newQuestion.trim()}
        >
          Submit
        </button>
      </div>
    </div>

    <!-- Questions List -->
    {#if questionsLoading}
      <div class="flex justify-center py-6">
        <span class="loading loading-spinner loading-md text-primary"></span>
      </div>
    {:else if questions.length === 0}
      <div class="text-center py-8 text-gray-500">
        No questions yet. Be the first to ask!
      </div>
    {:else}
      <div class="space-y-4">
        {#each questions as question}
          <div class="bg-white rounded-lg shadow-sm border p-4">
            <!-- Question -->
            <div class="flex gap-3">
              <div class="avatar placeholder flex-shrink-0">
                <div class="bg-neutral-focus text-neutral-content rounded-full w-8 h-8">
                  <span class="text-sm">{question.user?.first_name?.[0]?.toUpperCase() || 'U'}</span>
                </div>
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm">
                    {question.user?.first_name} {question.user?.last_name}
                  </span>
                  {#if question.user?.role === 'entity'}
                    <span class="badge badge-warning badge-sm">Seller</span>
                  {:else if hasPurchased}
                    <span class="badge badge-success badge-sm">Verified Buyer</span>
                  {/if}
                </div>
                <p class="text-gray-700">{question.question_text}</p>
                <p class="text-xs text-gray-500">
                  Asked on {new Date(question.created).toLocaleDateString()}
                </p>
              </div>
            </div>

            <!-- Answers -->
            {#if question.answers?.length}
              <div class="ml-11 mt-3 space-y-3">
                <!-- Show first verified buyer answer or first answer -->
                {#if question.answers.length > 0}
                  {@const verifiedBuyerAnswer = question.answers.find(a => a.user?.role !== 'entity')}
                  {@const firstAnswer = verifiedBuyerAnswer || question.answers[0]}
                  <div class="border-l-2 border-primary/20 pl-4 py-2">
                    <div class="flex items-start gap-2">
                      <div class="avatar placeholder flex-shrink-0">
                        <div class="bg-primary/10 text-primary rounded-full w-6 h-6">
                          <span class="text-xs">{firstAnswer.user?.first_name?.[0]?.toUpperCase() || 'U'}</span>
                        </div>
                      </div>
                      <div class="flex-1 space-y-1">
                        <div class="flex items-center gap-2">
                          <span class="font-medium text-sm">{firstAnswer.user?.first_name} {firstAnswer.user?.last_name}</span>
                          {#if firstAnswer.user?.role === 'entity'}
                            <span class="badge badge-warning badge-sm">Seller</span>
                          {:else if hasPurchased}
                            <span class="badge badge-success badge-sm">Verified Buyer</span>
                          {/if}
                        </div>
                        <p class="text-gray-600 text-sm">{firstAnswer.answer_text}</p>
                        <p class="text-xs text-gray-500">
                          Answered on {new Date(firstAnswer.created).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Show expand button if there are more answers -->
                  {#if question.answers.length > 1}
                    <details class="ml-4">
                      <summary class="cursor-pointer text-sm text-primary hover:text-primary/80 mb-2">
                        Show {question.answers.length - 1} more {question.answers.length - 1 === 1 ? 'reply' : 'replies'}
                      </summary>
                      {#each question.answers.filter(a => a !== firstAnswer) as answer}
                        <div class="border-l-2 border-primary/20 pl-4 py-2">
                          <div class="flex items-start gap-2">
                            <div class="avatar placeholder flex-shrink-0">
                              <div class="bg-primary/10 text-primary rounded-full w-6 h-6">
                                <span class="text-xs">{answer.user?.first_name?.[0]?.toUpperCase() || 'U'}</span>
                              </div>
                            </div>
                            <div class="flex-1 space-y-1">
                              <div class="flex items-center gap-2">
                                <span class="font-medium text-sm">{answer.user?.first_name} {answer.user?.last_name}</span>
                                {#if answer.user?.role === 'entity'}
                                  <span class="badge badge-warning badge-sm">Seller</span>
                                {:else if hasPurchased}
                                  <span class="badge badge-success badge-sm">Verified Buyer</span>
                                {/if}
                              </div>
                              <p class="text-gray-600 text-sm">{answer.answer_text}</p>
                              <p class="text-xs text-gray-500">
                                Answered on {new Date(answer.created).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      {/each}
                    </details>
                  {/if}
                {/if}
              </div>
            {/if}

            <!-- Answer Input -->
            <div class="ml-11 mt-3">
              <div class="flex gap-2">
                <input
                  type="text"
                  bind:value={newAnswer[question.id]}
                  placeholder="Write a reply..."
                  class="input input-bordered input-sm w-full text-sm focus:ring-2 focus:ring-primary/20"
                />
                <button
                  on:click={() => submitAnswer(question.id)}
                  class="btn btn-sm btn-outline btn-primary"
                  disabled={!newAnswer[question.id]?.trim()}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
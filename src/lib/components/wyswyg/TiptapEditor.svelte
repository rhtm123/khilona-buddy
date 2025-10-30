<script>
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	import { writable } from 'svelte/store';

	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Bold from '@tiptap/extension-bold';
	import Italic from '@tiptap/extension-italic';
	import Underline from '@tiptap/extension-underline';
	import Blockquote from '@tiptap/extension-blockquote';
	import CodeBlock from '@tiptap/extension-code-block';


	export let content = '';
	const dispatch = createEventDispatcher();
	let element;
	let editor;
	const editorState = writable(null); // Make editor reactive
	let lastContent = content;

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit,
				Bold,
				Italic,
				Underline,
				Blockquote,
				CodeBlock
			],
			content: content,
			onUpdate: ({ editor }) => {
				dispatch('change', editor.getHTML());
			},
		});

		// Store editor instance
		editorState.set(editor);
	});

	onDestroy(() => {
		if (editor) editor.destroy();
	});

	$: if (editor && content !== lastContent) {
		editor.commands.setContent(content || '<p></p>');
		lastContent = content;
	}
</script>


<div class="rounded-lg border">


{#if $editorState}
	<div class="toolbar flex gap-2 p-2 bg-gray-100 rounded-t-lg">
		<button on:click={() => $editorState.chain().focus().toggleBold().run()} class={$editorState.isActive('bold') ? 'active' : ''}>
			<strong>B</strong>
		</button>
		<button on:click={() => $editorState.chain().focus().toggleItalic().run()} class={$editorState.isActive('italic') ? 'active' : ''}>
			<em>I</em>
		</button>
		<button on:click={() => $editorState.chain().focus().toggleUnderline().run()} class={$editorState.isActive('underline') ? 'active' : ''}>
			<u>U</u>
		</button>
		<button on:click={() => $editorState.chain().focus().toggleHeading({ level: 1 }).run()} class={$editorState.isActive('heading', { level: 1 }) ? 'active' : ''}>
			H1
		</button>
		<button on:click={() => $editorState.chain().focus().toggleHeading({ level: 2 }).run()} class={$editorState.isActive('heading', { level: 2 }) ? 'active' : ''}>
			H2
		</button>
		<button on:click={() => $editorState.chain().focus().setParagraph().run()} class={$editorState.isActive('paragraph') ? 'active' : ''}>
			P
		</button>
		<button on:click={() => $editorState.chain().focus().toggleBulletList().run()} class={$editorState.isActive('bulletList') ? 'active' : ''}>
			&#8226; List
		</button>
		<button on:click={() => $editorState.chain().focus().toggleBlockquote().run()} class={$editorState.isActive('blockquote') ? 'active' : ''}>
			❝ Quote
		</button>
		<button on:click={() => $editorState.chain().focus().toggleCodeBlock().run()} class={$editorState.isActive('codeBlock') ? 'active' : ''}>
			&lt;/&gt; Code
		</button>
	</div>
{/if}

<div class="w-full prose max-w-none m-auto p-0 ">
	<div class="min-h-24 p-2 bg-white rounded-lg" bind:this={element} />
</div>

</div>

<style>
	.toolbar button {
		border: none;
		padding: 4px 8px;
		background: white;
		cursor: pointer;
		border-radius: 4px;
		font-size: 14px;
		transition: 0.2s;
	}

	.toolbar button:hover {
		background: #ddd;
	}

	.toolbar button.active {
		background: black;
		color: white;
	}
</style>
<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  note: {
    type: Object,
    default: null,
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['create', 'update', 'delete']);

const title = ref('');
const content = ref('');

watch(
  () => props.note,
  (newNote) => {
    title.value = newNote?.title ?? '';
    content.value = newNote?.content ?? '';
  },
  { immediate: true },
);

const hasSelection = computed(() => Boolean(props.note));

const submit = () => {
  if (!title.value.trim() || !content.value.trim()) {
    return;
  }

  const payload = { title: title.value.trim(), content: content.value.trim() };

  if (hasSelection.value) {
    emit('update', props.note.id, payload);
  } else {
    emit('create', payload);
    title.value = '';
    content.value = '';
  }
};

const remove = () => {
  if (hasSelection.value) {
    emit('delete', props.note.id);
    title.value = '';
    content.value = '';
  }
};
</script>

<template>
  <section class="panel">
    <h2>{{ hasSelection ? 'Edit note' : 'Create note' }}</h2>

    <div class="field-group">
      <label for="title">Title</label>
      <input id="title" v-model="title" maxlength="120" placeholder="Note title" />
    </div>

    <div class="field-group">
      <label for="content">Content</label>
      <textarea id="content" v-model="content" rows="12" placeholder="Write your note..." />
    </div>

    <div class="actions">
      <button :disabled="saving" @click="submit">
        {{ saving ? 'Saving...' : hasSelection ? 'Update' : 'Create' }}
      </button>
      <button v-if="hasSelection" class="danger" :disabled="saving" @click="remove">Delete</button>
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
}

h2 {
  margin-top: 0;
}

.field-group {
  margin-bottom: 12px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #374151;
}

input,
textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px;
  font: inherit;
}

textarea {
  resize: vertical;
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  border: 0;
  border-radius: 8px;
  background: #4f46e5;
  color: #fff;
  padding: 10px 14px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.danger {
  background: #dc2626;
}
</style>

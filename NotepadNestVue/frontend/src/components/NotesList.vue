<script setup>
defineProps({
  notes: {
    type: Array,
    required: true,
  },
  selectedNoteId: {
    type: Number,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select']);
</script>

<template>
  <section class="panel">
    <h2>Notes</h2>

    <p v-if="loading">Loading notes...</p>
    <p v-else-if="!notes.length" class="muted">No notes yet. Create your first note.</p>

    <ul v-else class="list">
      <li v-for="note in notes" :key="note.id">
        <button
          class="note-item"
          :class="{ active: note.id === selectedNoteId }"
          @click="emit('select', note.id)"
        >
          <strong>{{ note.title }}</strong>
          <small>{{ new Date(note.updatedAt).toLocaleString() }}</small>
        </button>
      </li>
    </ul>
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

.muted {
  color: #6b7280;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}

.note-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
  cursor: pointer;
}

.note-item.active {
  border-color: #4f46e5;
  background: #eef2ff;
}

small {
  margin-top: 4px;
  color: #6b7280;
}
</style>

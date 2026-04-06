<script setup>
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import NotesList from './components/NotesList.vue';
import NoteEditor from './components/NoteEditor.vue';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const notes = ref([]);
const selectedNoteId = ref(null);
const loading = ref(false);
const saving = ref(false);
const error = ref('');

const selectedNote = computed(() =>
  notes.value.find((note) => note.id === selectedNoteId.value) ?? null,
);

const fetchNotes = async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await axios.get(`${apiBaseUrl}/notes`);
    notes.value = data;
    if (!selectedNoteId.value && data.length) {
      selectedNoteId.value = data[0].id;
    }
  } catch {
    error.value = 'Failed to load notes. Please check backend availability.';
  } finally {
    loading.value = false;
  }
};

const createNote = async (payload) => {
  saving.value = true;
  error.value = '';
  try {
    const { data } = await axios.post(`${apiBaseUrl}/notes`, payload);
    notes.value.unshift(data);
    selectedNoteId.value = data.id;
  } catch {
    error.value = 'Failed to create note.';
  } finally {
    saving.value = false;
  }
};

const updateNote = async (id, payload) => {
  saving.value = true;
  error.value = '';
  try {
    const { data } = await axios.put(`${apiBaseUrl}/notes/${id}`, payload);
    const idx = notes.value.findIndex((note) => note.id === id);
    if (idx !== -1) {
      notes.value[idx] = data;
    }
  } catch {
    error.value = 'Failed to update note.';
  } finally {
    saving.value = false;
  }
};

const deleteNote = async (id) => {
  saving.value = true;
  error.value = '';
  try {
    await axios.delete(`${apiBaseUrl}/notes/${id}`);
    notes.value = notes.value.filter((note) => note.id !== id);
    selectedNoteId.value = notes.value[0]?.id ?? null;
  } catch {
    error.value = 'Failed to delete note.';
  } finally {
    saving.value = false;
  }
};

onMounted(fetchNotes);
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>Notepad</h1>
      <p>Vue + NestJS</p>
    </header>

    <p v-if="error" class="error-banner">{{ error }}</p>

    <main class="content-grid">
      <NotesList
        :notes="notes"
        :loading="loading"
        :selected-note-id="selectedNoteId"
        @select="selectedNoteId = $event"
      />

      <NoteEditor
        :note="selectedNote"
        :saving="saving"
        @create="createNote"
        @update="updateNote"
        @delete="deleteNote"
      />
    </main>
  </div>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: Inter, Segoe UI, Arial, sans-serif;
  background: #f5f7fb;
  color: #1f2937;
}

.app-shell {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.app-header {
  margin-bottom: 16px;
}

.app-header h1 {
  margin: 0;
  font-size: 2rem;
}

.app-header p {
  margin: 4px 0 0;
  color: #6b7280;
}

.error-banner {
  margin: 8px 0 16px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #fef2f2;
  color: #b91c1c;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;
}

@media (max-width: 820px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>

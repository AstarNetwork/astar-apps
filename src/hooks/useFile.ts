import { ref } from 'vue';

export interface FileState {
  data: Uint8Array;
  name: string;
  size: number;
  type: string;
}

interface FileOptions {
  defaultValue?: FileState | null;
  onChange?: (_: FileState) => void;
  onRemove?: () => void;
  validate?: (_: FileState) => boolean;
}

// Simple wrapper for a true/false toggle
export function useFile({
  defaultValue = null,
  onChange,
  onRemove,
  validate = (file: FileState): boolean => file.data.length > 0,
}: FileOptions | undefined = {}) {
  const fileRef = ref<FileState | null>(defaultValue);

  const setFile = (file: FileState | null) => {
    if (file) {
      fileRef.value = file;
      console.log('fileState', file);
      onChange && onChange(file);
    } else {
      fileRef.value = null;
      onRemove && onRemove();
    }
  };

  return { fileRef, setFile, validate };
}

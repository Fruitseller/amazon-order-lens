import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import styles from "./DropZone.module.css";

export interface DropZoneProps {
  onFile: (file: File) => void;
}

function isAcceptable(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".zip") || name.endsWith(".csv");
}

export function DropZone({ onFile }: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const file = files[0]!;
    if (!isAcceptable(file)) {
      setError("Falsches Format. Nur ZIP (Amazon-Export) oder CSV-Dateien.");
      return;
    }
    setError(null);
    onFile(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const openPicker = () => inputRef.current?.click();

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  };

  return (
    <div
      data-testid="dropzone"
      data-drag-active={dragActive ? "true" : "false"}
      className={styles.zone}
      role="button"
      tabIndex={0}
      aria-label="Datei hochladen"
      onClick={openPicker}
      onKeyDown={onKeyDown}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className={styles.title}>ZIP-Datei hier ablegen</div>
      <div className={styles.hint}>oder klicken, um eine Datei auszuwählen</div>
      <div className={styles.hint}>.zip (Amazon-Export) oder .csv</div>
      <input
        ref={inputRef}
        type="file"
        accept=".zip,.csv,application/zip,text/csv"
        className={styles.hidden}
        onChange={onChange}
      />
      {error && (
        <div role="alert" className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
}

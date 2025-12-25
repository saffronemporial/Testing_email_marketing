import { useState } from "react";
import "../styles/emailMarketing.css";
import "./templateBuilderDnD.css";

const BLOCK_LIBRARY = [
  { type: "header", label: "Header" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "button", label: "Button" },
  { type: "divider", label: "Divider" },
  { type: "footer", label: "Footer" }
];

export default function TemplateBuilderDnD({ value = [], onChange }) {
  const [blocks, setBlocks] = useState(value);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  /* ---------------- ADD BLOCK ---------------- */
  const addBlock = (type) => {
    const block = {
      id: crypto.randomUUID(),
      type,
      order: blocks.length,
      props: getDefaultProps(type)
    };

    const updated = [...blocks, block];
    setBlocks(updated);
    onChange(updated);
  };

  /* ---------------- DRAG ---------------- */
  const onDragStart = (index) => setDragIndex(index);

  const onDrop = (index) => {
    if (dragIndex === null) return;
    const reordered = [...blocks];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);

    setBlocks(reordered);
    onChange(reordered);
    setDragIndex(null);
  };

  /* ---------------- UPDATE BLOCK ---------------- */
  const updateBlock = (id, patch) => {
    const updated = blocks.map((b) =>
      b.id === id ? { ...b, props: { ...b.props, ...patch } } : b
    );
    setBlocks(updated);
    onChange(updated);
  };

  return (
    <div className="template-builder-root">

      {/* LEFT PANEL */}
      <div className="builder-panel left">
        <h3>Blocks</h3>
        {BLOCK_LIBRARY.map((b) => (
          <button
            key={b.type}
            className="em-btn-ghost"
            onClick={() => addBlock(b.type)}
          >
            + {b.label}
          </button>
        ))}
      </div>

      {/* CENTER CANVAS */}
      <div className="builder-canvas">
        <div className="email-preview">
          {blocks.length === 0 && (
            <div className="empty-canvas">
              Drag blocks to start building email
            </div>
          )}

          {blocks.map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
              onClick={() => setActiveBlockId(block.id)}
              className={`email-block ${
                activeBlockId === block.id ? "active" : ""
              }`}
            >
              {renderBlock(block)}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT CONFIG PANEL */}
      <div className="builder-panel right">
        <h3>Settings</h3>

        {!activeBlockId && (
          <p className="em-muted">
            Select a block to configure
          </p>
        )}

        {activeBlockId && (
          <BlockSettings
            block={blocks.find((b) => b.id === activeBlockId)}
            onChange={(p) => updateBlock(activeBlockId, p)}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */

function getDefaultProps(type) {
  switch (type) {
    case "header":
      return { text: "Your Heading" };
    case "text":
      return { text: "Your content here" };
    case "image":
      return { src: "", alt: "" };
    case "button":
      return { label: "Call To Action", url: "#" };
    case "footer":
      return { text: "© Saffron Emporial" };
    default:
      return {};
  }
}

function renderBlock(block) {
  switch (block.type) {
    case "header":
      return <h1>{block.props.text}</h1>;
    case "text":
      return <p>{block.props.text}</p>;
    case "button":
      return (
        <a className="email-btn" href={block.props.url}>
          {block.props.label}
        </a>
      );
    case "image":
      return block.props.src ? (
        <img src={block.props.src} alt={block.props.alt} />
      ) : (
        <div className="image-placeholder">Image</div>
      );
    case "divider":
      return <hr />;
    case "footer":
      return <small>{block.props.text}</small>;
    default:
      return null;
  }
}

function BlockSettings({ block, onChange }) {
  if (!block) return null;

  if (block.type === "button") {
    return (
      <>
        <label>Label</label>
        <input
          value={block.props.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
        <label>URL</label>
        <input
          value={block.props.url}
          onChange={(e) => onChange({ url: e.target.value })}
        />
      </>
    );
  }

  if (block.type === "text" || block.type === "header") {
    return (
      <>
        <label>Text</label>
        <textarea
          value={block.props.text}
          onChange={(e) => onChange({ text: e.target.value })}
        />
      </>
    );
  }

  return <p className="em-muted">No settings available</p>;
}

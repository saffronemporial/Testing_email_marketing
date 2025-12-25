import { useMemo, useState } from "react";
import "../styles/emailMarketing.css";
import "./templatePreview.css";

/**
 * props:
 *  - blocks: array (email blocks JSON)
 *  - variables: [{ key, default_value }]
 *  - previewData: optional override values
 */
export default function TemplatePreview({
  blocks = [],
  variables = [],
  previewData = {}
}) {
  const [device, setDevice] = useState("desktop");

  /* -------------------------------------------------------
     VARIABLE RESOLUTION
  -------------------------------------------------------- */
  const resolved = useMemo(() => {
    const values = {};
    variables.forEach((v) => {
      values[v.key] =
        previewData[v.key] ??
        v.default_value ??
        `{${v.key}}`;
    });

    let unresolved = [];

    const resolveText = (text = "") =>
      text.replace(/\{(\w+)\}/g, (_, key) => {
        if (!values[key]) {
          unresolved.push(key);
          return `{${key}}`;
        }
        return values[key];
      });

    return {
      blocks: blocks.map((b) => ({
        ...b,
        resolvedText: b.props?.text
          ? resolveText(b.props.text)
          : null
      })),
      unresolved: [...new Set(unresolved)]
    };
  }, [blocks, variables, previewData]);

  /* -------------------------------------------------------
     QA CHECKS
  -------------------------------------------------------- */
  const qa = useMemo(() => {
    let hasCTA = false;
    let unsafeLinks = 0;

    blocks.forEach((b) => {
      if (b.type === "button") hasCTA = true;
      if (b.type === "button" && b.props?.url?.startsWith("http://")) {
        unsafeLinks++;
      }
    });

    return {
      hasCTA,
      unsafeLinks,
      unresolvedCount: resolved.unresolved.length
    };
  }, [blocks, resolved]);

  return (
    <div className="em-fade-up template-preview-root">

      {/* HEADER */}
      <div className="template-preview-header">
        <h4>Email Preview</h4>

        <div className="device-toggle">
          <button
            className={device === "desktop" ? "active" : ""}
            onClick={() => setDevice("desktop")}
          >
            Desktop
          </button>
          <button
            className={device === "mobile" ? "active" : ""}
            onClick={() => setDevice("mobile")}
          >
            Mobile
          </button>
        </div>
      </div>

      {/* QA BAR */}
      {(qa.unresolvedCount > 0 || !qa.hasCTA || qa.unsafeLinks > 0) && (
        <div className="qa-bar">
          {qa.unresolvedCount > 0 && (
            <span className="warn">
              ⚠ {qa.unresolvedCount} unresolved variables
            </span>
          )}
          {!qa.hasCTA && (
            <span className="warn">
              ⚠ No CTA button detected
            </span>
          )}
          {qa.unsafeLinks > 0 && (
            <span className="warn">
              ⚠ Unsafe HTTP links found
            </span>
          )}
        </div>
      )}

      {/* PREVIEW FRAME */}
      <div className={`preview-frame ${device}`}>
        <div className="email-canvas">
          {resolved.blocks.map((b, i) => (
            <EmailBlock key={i} block={b} />
          ))}
        </div>
      </div>

    </div>
  );
}

/* -------------------------------------------------------
   BLOCK RENDERER (EMAIL SAFE)
-------------------------------------------------------- */
function EmailBlock({ block }) {
  switch (block.type) {
    case "header":
      return <h1>{block.resolvedText}</h1>;

    case "text":
      return <p>{block.resolvedText}</p>;

    case "image":
      return (
        <img
          src={block.props.src}
          alt={block.props.alt || ""}
          style={{ maxWidth: "100%" }}
        />
      );

    case "button":
      return (
        <a
          href={block.props.url}
          className="email-btn"
          target="_blank"
          rel="noreferrer"
        >
          {block.props.label}
        </a>
      );

    case "divider":
      return <hr />;

    default:
      return null;
  }
}

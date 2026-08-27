import { Fragment, type ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const tokens = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return tokens.map((token, index) => {
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a href={link[2]} key={index} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("`") && token.endsWith("`")) {
      return <code key={index}>{token.slice(1, -1)}</code>;
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    return <Fragment key={index}>{token}</Fragment>;
  });
}

export function MarkdownBlock({ content }: { content: string }) {
  if (!content) return null;
  const blocks = content.split(/\n\s*\n/).filter(Boolean);

  return (
    <div className="markdown-block">
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) {
          const [heading, ...rest] = block.split("\n");
          return (
            <section key={index}>
              <h3>{inline(heading.slice(4))}</h3>
              {rest.length > 0 ? <p>{inline(rest.join(" "))}</p> : null}
            </section>
          );
        }
        if (block.split("\n").every((line) => line.startsWith("- "))) {
          return (
            <ul key={index}>
              {block.split("\n").map((line, itemIndex) => (
                <li key={itemIndex}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          );
        }
        if (block.startsWith("> ")) {
          return <blockquote key={index}>{inline(block.replace(/^>\s?/gm, ""))}</blockquote>;
        }
        return <p key={index}>{inline(block.replace(/\n/g, " "))}</p>;
      })}
    </div>
  );
}

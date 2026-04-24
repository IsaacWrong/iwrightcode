import TypeOnScroll from "./TypeOnScroll";

type Props = {
  caption: string;
  title: string;
  size?: "lg" | "md";
  as?: "h2" | "h3";
};

export default function SectionHeading({
  caption,
  title,
  size = "lg",
  as = "h2",
}: Props) {
  const Tag = as;
  const sizeClass = size === "lg" ? "text-[28px]" : "text-[20px]";

  return (
    <header>
      <p className="font-mono text-[11px] text-muted">{caption}</p>
      <Tag
        className={`font-mono font-medium ${sizeClass} text-fg mt-2`}
        style={{ lineHeight: 1.3 }}
      >
        <TypeOnScroll text={title} />
      </Tag>
    </header>
  );
}

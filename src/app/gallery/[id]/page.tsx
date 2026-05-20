import ProjectDetailClient from "./ProjectDetailClient";

export function generateStaticParams() {
  return [{ id: "_placeholder" }];
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailClient id={id} />;
}

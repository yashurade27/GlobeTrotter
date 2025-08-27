// Route group layouts should not duplicate HTML structure
// The root layout already provides the HTML shell
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
import Navigation from "../components/Navigation";

export default function MainLayout({ children }) {
  return (
    <>
      <Navigation />
      {/* add padding-top so content doesn’t overlap the navbar */}
      <main className="pt-16">{children}</main>
    </>
  );
}

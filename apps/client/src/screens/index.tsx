import Header from "../components/header";
import Scrubber from "../components/scrubber";

function Index() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Header />
      <Scrubber />
    </div>
  );
}

export default Index;

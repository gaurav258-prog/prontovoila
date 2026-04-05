import Header from './components/Header';
import StepBar from './components/StepBar';
import UploadStep from './components/UploadStep';
import DetectStep from './components/DetectStep';
import BriefingStep from './components/BriefingStep';
import FollowUpStep from './components/FollowUpStep';
import ConfirmStep from './components/ConfirmStep';
import ResultsStep from './components/ResultsStep';
import { useAppStore } from './store/appStore';
import './styles/app.css';

function App() {
  const step = useAppStore((s) => s.step);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <UploadStep />;
      case 2:
        return <DetectStep />;
      case 3:
        return <BriefingStep />;
      case 4:
        return <FollowUpStep />;
      case 5:
        return <ConfirmStep />;
      case 6:
        return <ResultsStep />;
      default:
        return <UploadStep />;
    }
  };

  return (
    <div className="shell">
      <Header />
      <StepBar />
      <div className="fade-in" key={step}>
        {renderStep()}
      </div>
    </div>
  );
}

export default App;

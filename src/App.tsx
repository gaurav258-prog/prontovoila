import Header from './components/Header';
import StepBar from './components/StepBar';
import UploadStep from './components/UploadStep';
import LanguageStep from './components/LanguageStep';
import InterviewStep from './components/InterviewStep';
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
        return <LanguageStep />;
      case 3:
        return <InterviewStep />;
      case 4:
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

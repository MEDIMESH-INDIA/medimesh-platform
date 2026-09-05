import { useLocation } from 'react-router-dom';
import MedimeshBackground from '../common/MedimeshBackground';

export default function MEDIMESHBackground() {
  const location = useLocation();
  const path = location.pathname;

  let graph = 'medium';
  let mesh = 'light';

  if (path === '/app') {
    mesh = 'medium';
  } else if (path.includes('/app/discover')) {
    mesh = 'light';
  } else if (path.includes('/app/hospitals')) {
    mesh = 'light';
  } else if (path.includes('/app/compare') || path.includes('/app/saved')) {
    graph = 'light';
    mesh = 'minimal';
  } else if (path === '/doctor' || path === '/hospital' || path === '/admin') {
    mesh = 'light';
  } else {
    graph = 'light';
    mesh = 'minimal';
  }

  return <MedimeshBackground graph={graph} mesh={mesh} />;
}

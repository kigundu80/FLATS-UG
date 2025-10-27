
import React from 'react';
import ReactDOM from 'react-dom/client';
import DriverApp from './DriverApp';

const driverRootElement = document.getElementById('driver-root');
if (!driverRootElement) {
  throw new Error("Could not find driver-root element to mount to");
}

const driverRoot = ReactDOM.createRoot(driverRootElement);
driverRoot.render(
  <React.StrictMode>
    <DriverApp />
  </React.StrictMode>
);

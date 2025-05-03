// import "./global.css";
import "./index.css";

export const metadata = {
  title: "UzTelecom AI Assistant",
  description: "UzTelecom AI Assistant",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>UzTelecom AI</title>
      </head>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;

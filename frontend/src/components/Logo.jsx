import React, { useState } from 'react';

const Logo = ({ size = "medium", showText = true, centered = false }) => {
  const [imageError, setImageError] = useState(false);
  
  // Original text sizes (unchanged)
  const textSizes = {
    small: "18px",
    medium: "28px",
    large: "38px",
    xlarge: "48px"
  };

  // Updated logo image sizes with 200px for large
  const logoImageSizes = {
    small: "40px",
    medium: "80px",
    large: "120px",      // 200x200px size
    xlarge: "150px"
  };

  const currentTextSize = textSizes[size] || textSizes.medium;
  const currentLogoSize = logoImageSizes[size] || logoImageSizes.medium;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      flexDirection: centered ? "column" : "row",
      gap: "25px",
      marginBottom: "32px",
      justifyContent: centered ? "center" : "flex-start"
    }}>
      {/* Logo Image Only - No Container */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: currentLogoSize,
        height: currentLogoSize
      }}>
        {!imageError ? (
          <img 
            src="/assets/icons/logo.png"
            alt="Lab Inventory Logo"
            style={{
              width: "280%",
              height: "140%",
              objectFit: "contain"
            }}
            onError={() => setImageError(true)}
          />
        ) : (
          <div style={{
            color: "white",
            fontSize: currentTextSize,
            fontWeight: "bold",
            fontFamily: "'Segoe UI', system-ui, sans-serif"
          }}>
            <span style={{ fontSize: "0.8em" }}>L</span>
            <span style={{ fontSize: "0.6em", opacity: 0.9 }}>I</span>
          </div>
        )}
      </div>
      
      {/* Logo Text */}
      {showText && (
        <div style={{ 
          textAlign: centered ? "center" : "left",
          lineHeight: 1.2
        }}>
          <h1 style={{
            margin: 0,
            fontSize: currentTextSize,
            fontWeight: 800,
            background: "linear-gradient(135deg, #f7f8ffff 0%, #f6f6ffff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.5px",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
          }}>
            Lab Inventory
          </h1>
          <p style={{
            margin: "6px 0 0 0",  // Original margin
            fontSize: "14px",      // Original font size
            color: "#f2f0faff",
            fontWeight: 500,
            letterSpacing: "0.3px",
            fontFamily: "'Inter', sans-serif"
          }}>
            Department Management System
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
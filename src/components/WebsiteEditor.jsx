import React, { useState, useEffect, useRef } from "react";
import { Eye, Code, Save, Upload } from "lucide-react";
import { mockAPI } from "../services/api";
import Button from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PropertyEditor from "./PropertyEditor";
import {
  SandpackProvider,
  SandpackPreview,
  SandpackLayout,
  SandpackFileExplorer,
  SandpackCodeEditor,
  useSandpack,
} from "@codesandbox/sandpack-react";

const ActiveFileTracker = ({ onChange, onCodeChange }) => {
  const { sandpack } = useSandpack();
  const prevCodeRef = useRef(null);
  const updateInProgress = useRef(false);

  useEffect(() => {
    const activeFile = sandpack.activeFile;
    if (!activeFile || updateInProgress.current) return;

    const currentCode = sandpack.files[activeFile]?.code;
    if (!currentCode) return;

    // Only process if code actually changed
    if (prevCodeRef.current !== currentCode) {
      updateInProgress.current = true;
      
      // 1. Update React state (for persistence across view switches)
      if (onCodeChange) {
        onCodeChange(currentCode, activeFile);
      }
      
      // 2. Update Sandpack (for immediate preview updates)
      sandpack.updateFile(activeFile, currentCode);
      sandpack.runSandpack();
      
      // 3. Call the original onChange callback
      if (onChange) {
        onChange(activeFile, currentCode);
      }
      
      updateInProgress.current = false;
    }

    prevCodeRef.current = currentCode;
  }, [sandpack.files, sandpack.activeFile, onChange, onCodeChange]);

  return null;
};

const SandpackListener = ({ onCodeChange, onPreviewReady }) => {
  const { listen, sandpack } = useSandpack();

  useEffect(() => {
    const unsubscribe = listen((msg) => {
      if (msg.type === 'file-update') {
        onCodeChange?.(msg.code, msg.path);
      }

      if (msg.type === 'done' && onPreviewReady) {
        setTimeout(onPreviewReady, 100);
      }

      if (msg.type === 'status') {
        // console.log('Sandpack status:', msg.status);
      }
    });

    return unsubscribe;
  }, [listen, onCodeChange, onPreviewReady]);

  return null;
};

const useElementInteraction = () => {
  const createPreviewFiles = (originalFiles) => {
    if (!originalFiles) return originalFiles;

    // Create interaction utilities file
    const interactionUtilsCode = `// Element interaction system for Sandpack
let selectedElement = null;
let isListenerActive = false;

const addStyles = () => {
  if (document.getElementById('sandpack-interaction-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'sandpack-interaction-styles';
  style.innerHTML = \`
    .sandpack-hoverable {
      outline: 2px dashed rgba(59, 130, 246, 0.3) !important;
      cursor: pointer !important;
      transition: outline-color 0.2s ease;
    }
    .sandpack-hoverable:hover {
      outline-color: rgba(59, 130, 246, 0.6) !important;
    }
    .sandpack-selected {
      outline: 3px solid rgba(59, 130, 246, 1) !important;
      background-color: rgba(59, 130, 246, 0.05) !important;
      position: relative;
    }
    .sandpack-selected::after {
      content: attr(data-element-info);
      position: absolute;
      top: -25px;
      left: 0;
      background: rgba(59, 130, 246, 0.9);
      color: white;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 11px;
      font-family: monospace;
      pointer-events: none;
      z-index: 1000;
    }
  \`;
  document.head.appendChild(style);
};

const generateSelector = (element) => {
  if (element.id) return '#' + element.id;
  
  let selector = element.tagName.toLowerCase();
  
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ')
      .filter(cls => cls && !cls.startsWith('sandpack-'))
      .slice(0, 3);
    if (classes.length > 0) {
      selector += '.' + classes.join('.');
    }
  }
  
  return selector;
};

const getElementInfo = (el) => {
  const styles = window.getComputedStyle(el);
  return {
    type: 'ELEMENT_SELECTED',
    tagName: el.tagName,
    selector: generateSelector(el),
    textContent: el.textContent?.trim() || '',
    innerHTML: el.innerHTML,
    className: el.className,
    id: el.id,
    styles: {
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      fontStyle: styles.fontStyle,
      fontFamily: styles.fontFamily,
      padding: styles.padding,
      margin: styles.margin,
      display: styles.display,
      textAlign: styles.textAlign,
      borderRadius: styles.borderRadius,
      border: styles.border,
      width: styles.width,
      height: styles.height,
    }
  };
};

const updateElementStyle = (element, property, value) => {
  if (!element) return;
  
  try {
    switch (property) {
      case 'textContent':
        element.textContent = value;
        break;
      case 'innerHTML':
        element.innerHTML = value;
        break;
      case 'className':
        element.className = value;
        break;
      default:
        if (property.startsWith('--')) {
          element.style.setProperty(property, value);
        } else {
          element.style[property] = value;
        }
        break;
    }
  } catch (error) {
    console.error('Error updating element style:', error);
  }
};

const setupEventListeners = () => {
  if (isListenerActive) return;
  isListenerActive = true;
  
  addStyles();

  document.addEventListener('mouseover', (e) => {
    if (e.target === selectedElement) return;
    e.target.classList.add('sandpack-hoverable');
  });

  document.addEventListener('mouseout', (e) => {
    e.target.classList.remove('sandpack-hoverable');
  });

  document.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selectedElement) {
      selectedElement.classList.remove('sandpack-selected');
      selectedElement.removeAttribute('data-element-info');
    }
    
    const target = e.target;
    selectedElement = target;
    
    target.classList.remove('sandpack-hoverable');
    target.classList.add('sandpack-selected');
    target.setAttribute('data-element-info', \`\${target.tagName.toLowerCase()}\${target.id ? '#' + target.id : ''}\${target.className ? '.' + target.className.split(' ')[0] : ''}\`);
    
    const info = getElementInfo(target);
    window.parent.postMessage(info, '*');
  });
  
  window.addEventListener('message', (e) => {
    if (e.data.type === 'UPDATE_ELEMENT_STYLE' && selectedElement) {
      const { property, value } = e.data;
      updateElementStyle(selectedElement, property, value);
    } else if (e.data.type === 'CLEAR_SELECTION' && selectedElement) {
      selectedElement.classList.remove('sandpack-selected');
      selectedElement.removeAttribute('data-element-info');
      selectedElement = null;
    }
  });
  window.parent.postMessage({ type: 'INTERACTION_READY' }, '*');
};

const initializeInteraction = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(setupEventListeners, 100);
    });
  } else {
    setTimeout(setupEventListeners, 100);
  }
};

export default initializeInteraction;`;

    // Create preview files with interaction code
    const previewFiles = { ...originalFiles };

    // Add interaction utils file
    previewFiles["/interaction-utils.js"] = {
      code: interactionUtilsCode
    };

    // Update App.tsx for preview with interaction imports
    if (originalFiles["/App.tsx"]) {
      const originalCode = originalFiles["/App.tsx"].code;

      // Check if the import already exists to prevent duplicates
      const hasInteractionImport = originalCode.includes("import initializeInteraction from './interaction-utils';");
      const hasUseEffectImport = originalCode.includes("import React, { useEffect }");
      const hasInitializationCall = originalCode.includes("initializeInteraction()");

      let updatedCode = originalCode;

      // Only add imports if they don't already exist
      if (!hasInteractionImport) {
        if (!hasUseEffectImport) {
          // Replace React import to include useEffect
          updatedCode = updatedCode.replace(
            /import React(.*?);/,
            "import React, { useEffect } from 'react';"
          );
        }
        
        // Add the interaction import after React imports
        updatedCode = updatedCode.replace(
          /(import React.*?;)/,
          "$1\nimport initializeInteraction from './interaction-utils';"
        );
      }

      // Only add useEffect if initialization call doesn't exist
      if (!hasInitializationCall) {
        updatedCode = updatedCode.replace(
          "export default function App() {",
          `export default function App() {
  useEffect(() => {
    initializeInteraction();
  }, []);`
        );
      }

      previewFiles["/App.tsx"] = {
        ...originalFiles["/App.tsx"],
        code: updatedCode
      };
    }

    return previewFiles;
  };

  return { createPreviewFiles };
};

const WebsiteEditor = ({ component, onSave }) => {
  const [view, setView] = useState("preview");
  const [files, setFiles] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [componentId, setComponentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isInteractionReady, setIsInteractionReady] = useState(false);
  const [activeCodeFile, setActiveCodeFile] = useState("/App.tsx");
  const [isInitialized, setIsInitialized] = useState(false);
  const [compilationStatus, setCompilationStatus] = useState("idle");

  const sandpack = useRef(null);
  const updateInProgress = useRef(false);
  const lastCodeUpdate = useRef(Date.now());
  const filesRef = useRef(null);
  const previewContainerRef = useRef(null);

  const { createPreviewFiles } = useElementInteraction();

  // Update files ref whenever files change
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  // Clear selection when clicking outside preview area
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only clear selection when in preview mode and there's a selected element
      if (view !== 'preview' || !selectedElement) return;
      const clickedInPreview = previewContainerRef.current && previewContainerRef.current.contains(event.target);
      const clickedInPropertyEditor = propertyEditorRef.current && propertyEditorRef.current.contains(event.target);

      // Check if click is outside the preview container
      if (!clickedInPreview && !clickedInPropertyEditor) {
        setSelectedElement(null);

        // Also send message to preview iframe to clear visual selection
        const iframe = document.querySelector('iframe[src*="sandpack"]') ||
          document.querySelector('iframe[src*="codesandbox"]') ||
          document.querySelector('[class*="sandpack"] iframe');

        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'CLEAR_SELECTION'
          }, '*');
        }
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleClickOutside, true);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [view, selectedElement]);

  // Listen for messages from the preview iframe
  useEffect(() => {
    const handleMessage = (event) => {
      const { data } = event;

      if (data?.type === "ELEMENT_SELECTED") {
        setSelectedElement(data);
      } else if (data?.type === "INTERACTION_READY") {
        setIsInteractionReady(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Send style updates to the preview iframe
  const sendStyleUpdate = (property, value) => {
    if (!selectedElement || view !== 'preview') return;

    const iframe = document.querySelector('iframe[src*="sandpack"]') ||
      document.querySelector('iframe[src*="codesandbox"]') ||
      document.querySelector('[class*="sandpack"] iframe');

    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'UPDATE_ELEMENT_STYLE',
        property,
        value
      }, '*');
    }
  };

  const handleElementUpdate = (property, value, changeInfo = null) => {
    if (!selectedElement) return;
    sendStyleUpdate(property, value);

    setSelectedElement(prev => ({
      ...prev,
      [property]: value,
      styles: {
        ...prev.styles,
        [property]: value
      }
    }));

    updateFilesFromPreviewEnhanced(property, value, selectedElement, changeInfo);

    setSaveStatus("Auto-saved");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const updateFilesFromPreviewEnhanced = (property, newValue, elementInfo, changeInfo) => {
    if (!elementInfo || !filesRef.current || updateInProgress.current) return;
  
    updateInProgress.current = true;
  
    const filesToSearch = ["/App.tsx", "/HeroSection.tsx", "/FeaturesSection.tsx", "/ServicesSection.tsx", "/AboutSection.tsx"];
    const newFiles = { ...filesRef.current };
    let updated = false;
  
    let oldValue = changeInfo?.oldValue;
  
    // Special handling for textContent updates
    if (property === 'textContent') {
      
      // For text content, we need to be more intelligent about finding and replacing
      for (const filePath of filesToSearch) {
        if (newFiles[filePath] && newFiles[filePath].code) {
          let fileCode = newFiles[filePath].code;
          const originalCode = fileCode;
  
          // Try multiple replacement strategies for text content
          if (oldValue && oldValue.trim()) {
            // Strategy 1: Direct text replacement (escaped for regex)
            const escapedOldValue = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const textRegex = new RegExp(`>${escapedOldValue}<`, 'g');
            
            if (textRegex.test(fileCode)) {
              fileCode = fileCode.replace(textRegex, `>${newValue}<`);
              updated = true;
            } else {
              // Strategy 2: Look for JSX text content patterns
              const jsxTextRegex = new RegExp(`>\\s*${escapedOldValue}\\s*<`, 'g');
              if (jsxTextRegex.test(fileCode)) {
                fileCode = fileCode.replace(jsxTextRegex, `>${newValue}<`);
                updated = true;
              } else {
                // Strategy 3: Look for text within quotes (for string literals)
                const quotedTextRegex = new RegExp(`["'\`]${escapedOldValue}["'\`]`, 'g');
                if (quotedTextRegex.test(fileCode)) {
                  fileCode = fileCode.replace(quotedTextRegex, `"${newValue}"`);
                  updated = true;
                }
              }
            }
          } else if (!oldValue || !oldValue.trim()) {
            // Handle case where there was no previous text content
            // Look for empty JSX tags and add content
            const emptyTagRegex = />(\s*)</g;
            if (emptyTagRegex.test(fileCode)) {
              fileCode = fileCode.replace(emptyTagRegex, `>${newValue}<`);
              updated = true;
            }
          }
  
          if (updated) {
            newFiles[filePath] = { ...newFiles[filePath], code: fileCode };
            break;
          }
        }
      }
    } 
    // Handle className updates
    else if (property === 'className') {
      if (oldValue) {
        // Clean up className values (remove sandpack classes)
        if (property === 'className' && oldValue) {
          oldValue = oldValue
            .split(' ')
            .filter(cls => cls && !cls.startsWith('sandpack-'))
            .join(' ')
            .trim();
        }
  
        if (newValue) {
          newValue = newValue
            .split(' ')
            .filter(cls => cls && !cls.startsWith('sandpack-'))
            .join(' ')
            .trim();
        }
  
        // Simple search and replace for className
        for (const filePath of filesToSearch) {
          if (newFiles[filePath] && newFiles[filePath].code) {
            let fileCode = newFiles[filePath].code;
  
            if (fileCode.includes(oldValue)) {
              fileCode = fileCode.replace(oldValue, newValue);
              updated = true;
              newFiles[filePath] = { ...newFiles[filePath], code: fileCode };
              break;
            }
          }
        }
      }
    }
  
    if (updated) {
      setFiles(newFiles);
  
      if (sandpack.current) {
        Object.keys(newFiles).forEach(filePath => {
          if (filePath !== "/interaction-utils.js" && newFiles[filePath].code !== filesRef.current[filePath]?.code) {
            sandpack.current.updateFile(filePath, newFiles[filePath].code);
          }
        });
      }
    } else {
      // console.log("No files were updated - no exact match found for", property, oldValue, '->', newValue);
    }
  
    updateInProgress.current = false;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (componentId) {
        await mockAPI.updateComponent(componentId, component);
        setSaveStatus("Updated successfully");
      } else {
        const result = await mockAPI.saveComponent(component);
        setComponentId(result.id);
        setSaveStatus("Saved successfully");
      }
      if (onSave) onSave(component);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus("Save failed");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleUpload = async () => {
    try {
      const result = await mockAPI.saveComponent(component);
      setComponentId(result.id);
      setSaveStatus(`Component uploaded with ID: ${result.id}`);
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setSaveStatus("Upload failed");
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setCompilationStatus("idle");
    // Clear selection when switching views
    if (newView !== 'preview') {
      setSelectedElement(null);
    }
  };

  // Enhanced code change handler - removes debouncing for instant updates
  const handleCodeChange = (newCode, filePath) => {
    // Skip interaction utils file
    if (filePath === "/interaction-utils.js") return;

    setCompilationStatus("compiling");

    // Update files state immediately for instant auto-run
    setFiles((prevFiles) => {
      if (!prevFiles) return prevFiles;

      const updatedFiles = {
        ...prevFiles,
        [filePath]: {
          ...prevFiles[filePath],
          code: newCode,
        },
      };

      return updatedFiles;
    });
  };

  const handlePreviewReady = () => {
    setCompilationStatus("ready");
    setTimeout(() => setCompilationStatus("idle"), 2000);
  };

  // Generate the combined files
  const getAllFiles = () => {
    if (!files) return null;

    const baseFiles = { ...files };
    const previewFiles = createPreviewFiles(files);

    return {
      ...baseFiles,
      ...previewFiles
    };
  };

  const allFiles = getAllFiles();

  // Load and prepare files
  useEffect(() => {
    if (isInitialized) return;

    async function loadFiles() {
      try {
        const heroCode = await fetch("/preview-standalone/HeroSection.tsx").then((res) => res.text());
        const featuresCode = await fetch("/preview-standalone/FeaturesSection.tsx").then((res) => res.text());
        const servicesCode = await fetch("/preview-standalone/ServicesSection.tsx").then((res) => res.text());
        const aboutCode = await fetch("/preview-standalone/AboutSection.tsx").then((res) => res.text());

        const baseFiles = {
          "/App.tsx": {
            code: `import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import ServicesSection from './ServicesSection';
import AboutSection from './AboutSection';

export default function App() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <AboutSection />
    </div>
  );
}`,
          },
          "/HeroSection.tsx": { code: heroCode },
          "/FeaturesSection.tsx": { code: featuresCode },
          "/ServicesSection.tsx": { code: servicesCode },
          "/AboutSection.tsx": { code: aboutCode },
        };

        setFiles(baseFiles);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load files:', error);
        setSaveStatus("Failed to load files");

        // Enhanced fallback files
        const fallbackFiles = {
          "/App.tsx": {
            code: `import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import ServicesSection from './ServicesSection';
import AboutSection from './AboutSection';

export default function App() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <AboutSection />
    </div>
  );
}`
          },
          "/HeroSection.tsx": {
            code: `import React from 'react';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">Hero Section</h1>
        <p className="text-xl mb-8">This is the hero section content</p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Get Started
        </button>
      </div>
    </section>
  );
}`
          },
          "/FeaturesSection.tsx": {
            code: `import React from 'react';

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Feature 1</h3>
            <p className="text-gray-600">Description of feature 1</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Feature 2</h3>
            <p className="text-gray-600">Description of feature 2</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Feature 3</h3>
            <p className="text-gray-600">Description of feature 3</p>
          </div>
        </div>
      </div>
    </section>
  );
}`
          },
          "/ServicesSection.tsx": {
            code: `import React from 'react';

export default function ServicesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4">Service 1</h3>
            <p className="text-gray-600">Description of service 1</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4">Service 2</h3>
            <p className="text-gray-600">Description of service 2</p>
          </div>
        </div>
      </div>
    </section>
  );
}`
          },
          "/AboutSection.tsx": {
            code: `import React from 'react';

export default function AboutSection() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">About Us</h2>
          <p className="text-lg text-gray-600 mb-6">
            We are a company dedicated to providing excellent services and solutions.
          </p>
          <p className="text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
            tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
      </div>
    </section>
  );
}`
          }
        };

        setFiles(fallbackFiles);
        setIsInitialized(true);
      }
    }
    loadFiles();
  }, [isInitialized]);

  const baseFiles = ["/App.tsx", "/HeroSection.tsx", "/FeaturesSection.tsx", "/ServicesSection.tsx", "/AboutSection.tsx"];

  return (
    <div className="bg-gray-950 min-h-screen text-gray-50">
      {/* Top Navbar */}
      <div className="bg-gray-900/50 backdrop-blur-lg px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {selectedElement ? `Selected: ${selectedElement.tagName}` : 'Click an element to edit'}
          </span>

          <div className="flex items-center gap-2">
            {isInteractionReady && view === 'preview' && (
              <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">
                Interactive
              </span>
            )}

            {compilationStatus === 'compiling' && (
              <span className="text-xs text-blue-500 bg-blue-500/10 px-2 py-1 rounded animate-pulse">
                Auto-Running...
              </span>
            )}

            {compilationStatus === 'ready' && (
              <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">
                ✓ Updated
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus && <span className="text-sm text-green-500 font-medium">{saveStatus}</span>}
          <Button onClick={handleUpload} variant="secondary" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
          <Button onClick={handleSave} disabled={isSaving} variant="secondary" size="sm">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3">
        <div className="grid grid-cols-12 gap-3">
          {/* Element Properties */}
          <div className="col-span-12 lg:col-span-4">
            <Card className="bg-gray-900 border border-gray-800 text-gray-50">
              <CardHeader>
                <CardTitle>
                  Element Properties
                  {selectedElement && (
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      ({selectedElement.tagName})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PropertyEditor
                  selectedElement={selectedElement}
                  onUpdate={handleElementUpdate}
                />
              </CardContent>
            </Card>
          </div>

          {/* Code / Preview Area */}
          <div className="col-span-12 lg:col-span-8">
            <Card className="bg-gray-900 border border-gray-800 text-gray-50 gap-0 p-0">
              <div className="flex justify-between items-center p-2">
                <Tabs value={view} onValueChange={handleViewChange} className="w-auto">
                  <TabsList className="bg-gray-800/50 border border-gray-700">
                    <TabsTrigger
                      value="preview"
                      className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger
                      value="code"
                      className="data-[state=active]:bg-gray-700 data-[state=active]:text-gray-50"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Code
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <CardContent className="p-0 h-screen flex flex-col bg-black" ref={previewContainerRef}>
                {allFiles && isInitialized && (
                  <SandpackProvider
                    ref={sandpack}
                    template="react-ts"
                    theme="dark"
                    files={allFiles}
                    options={{
                      entry: "/App.tsx",
                      showTabs: view === "code",
                      showLineNumbers: view === "code",
                      wrapContent: true,
                      externalResources: ["https://cdn.tailwindcss.com"],
                      activeFile: activeCodeFile,
                      visibleFiles: baseFiles,
                      autorun: true,
                      recompileMode: "immediate",
                      recompileDelay: 0,
                    }}
                    customSetup={{
                      dependencies: {
                        react: "^18.0.0",
                        "react-dom": "^18.0.0",
                      },
                    }}
                  >
                    {view !== "preview" && <ActiveFileTracker 
  onChange={setActiveCodeFile}
  onCodeChange={handleCodeChange}
/>}
                    <SandpackListener
                      onCodeChange={handleCodeChange}
                      onPreviewReady={handlePreviewReady}
                    />

                    <SandpackLayout className="flex-1 min-h-screen">
                      {view === "code" && (
                        <SandpackFileExplorer
                          className="min-w-[200px]"
                          autoHiddenFiles={false}
                        />
                      )}

                      {view === "preview" ? (
                        <SandpackPreview
                          className="flex-1 min-h-screen"
                          style={{ backgroundColor: "#fff" }}
                          showOpenInCodeSandbox={false}
                          showRefreshButton={true}
                          showNavigator={false}
                        />
                      ) : (
                        <SandpackCodeEditor
                          showLineNumbers
                          wrapContent
                          className="flex-1 min-h-screen"
                          extensions={[]}
                        />
                      )}
                    </SandpackLayout>
                  </SandpackProvider>
                )}

                {/* Loading State */}
                {(!allFiles || !isInitialized) && (
                  <div className="p-4 text-center text-gray-400">Loading files...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Component ID Display */}
        {componentId && (
          <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="text-sm text-gray-300">
              <strong>Component ID:</strong> {componentId}
            </div>
            <div className="text-sm text-gray-400 mt-1">Preview URL: /preview/{componentId}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteEditor;
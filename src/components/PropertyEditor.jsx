import React, { useState, useRef, useEffect } from 'react';
import { Eye, Code, Save, Upload, Edit3, Type, Palette, Bold, Italic } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PropertyEditor = ({ selectedElement, onUpdate }) => {
    const [textContent, setTextContent] = useState('');
    const [fontSize, setFontSize] = useState('text-base');
    const [textColor, setTextColor] = useState('text-black');
    const [backgroundColor, setBackgroundColor] = useState('bg-white');
    const [fontWeight, setFontWeight] = useState('font-normal');
    const [fontStyle, setFontStyle] = useState('normal');
    const [fontFamily, setFontFamily] = useState('sans');
    const [padding, setPadding] = useState('p-0');
    const [margin, setMargin] = useState('m-0');
    const [className, setClassName] = useState('');
    const [localValues, setLocalValues] = useState({});
    // Ref to prevent circular updates
    const isUpdating = useRef(false);
    const previousValues = useRef({}); // Track previous values

    // Tailwind color options
    const textColors = [
        { value: 'text-black', label: 'Black' },
        { value: 'text-white', label: 'White' },
        { value: 'text-gray-50', label: 'Gray 50' },
        { value: 'text-gray-100', label: 'Gray 100' },
        { value: 'text-gray-200', label: 'Gray 200' },
        { value: 'text-gray-300', label: 'Gray 300' },
        { value: 'text-gray-400', label: 'Gray 400' },
        { value: 'text-gray-500', label: 'Gray 500' },
        { value: 'text-gray-600', label: 'Gray 600' },
        { value: 'text-gray-700', label: 'Gray 700' },
        { value: 'text-gray-800', label: 'Gray 800' },
        { value: 'text-gray-900', label: 'Gray 900' },
        { value: 'text-red-500', label: 'Red 500' },
        { value: 'text-red-600', label: 'Red 600' },
        { value: 'text-red-700', label: 'Red 700' },
        { value: 'text-blue-500', label: 'Blue 500' },
        { value: 'text-blue-600', label: 'Blue 600' },
        { value: 'text-blue-700', label: 'Blue 700' },
        { value: 'text-green-500', label: 'Green 500' },
        { value: 'text-green-600', label: 'Green 600' },
        { value: 'text-green-700', label: 'Green 700' },
        { value: 'text-yellow-500', label: 'Yellow 500' },
        { value: 'text-yellow-600', label: 'Yellow 600' },
        { value: 'text-purple-500', label: 'Purple 500' },
        { value: 'text-purple-600', label: 'Purple 600' },
        { value: 'text-indigo-500', label: 'Indigo 500' },
        { value: 'text-indigo-600', label: 'Indigo 600' },
        { value: 'text-pink-500', label: 'Pink 500' },
        { value: 'text-pink-600', label: 'Pink 600' },
        { value: 'text-orange-500', label: 'Orange 500' },
        { value: 'text-orange-600', label: 'Orange 600' }
    ];

    const backgroundColors = [
        { value: 'bg-transparent', label: 'Transparent' },
        { value: 'bg-black', label: 'Black' },
        { value: 'bg-white', label: 'White' },
        { value: 'bg-gray-50', label: 'Gray 50' },
        { value: 'bg-gray-100', label: 'Gray 100' },
        { value: 'bg-gray-200', label: 'Gray 200' },
        { value: 'bg-gray-300', label: 'Gray 300' },
        { value: 'bg-gray-400', label: 'Gray 400' },
        { value: 'bg-gray-500', label: 'Gray 500' },
        { value: 'bg-gray-600', label: 'Gray 600' },
        { value: 'bg-gray-700', label: 'Gray 700' },
        { value: 'bg-gray-800', label: 'Gray 800' },
        { value: 'bg-gray-900', label: 'Gray 900' },
        { value: 'bg-red-50', label: 'Red 50' },
        { value: 'bg-red-100', label: 'Red 100' },
        { value: 'bg-red-500', label: 'Red 500' },
        { value: 'bg-red-600', label: 'Red 600' },
        { value: 'bg-blue-50', label: 'Blue 50' },
        { value: 'bg-blue-100', label: 'Blue 100' },
        { value: 'bg-blue-500', label: 'Blue 500' },
        { value: 'bg-blue-600', label: 'Blue 600' },
        { value: 'bg-green-50', label: 'Green 50' },
        { value: 'bg-green-100', label: 'Green 100' },
        { value: 'bg-green-500', label: 'Green 500' },
        { value: 'bg-green-600', label: 'Green 600' },
        { value: 'bg-yellow-50', label: 'Yellow 50' },
        { value: 'bg-yellow-100', label: 'Yellow 100' },
        { value: 'bg-yellow-500', label: 'Yellow 500' },
        { value: 'bg-purple-50', label: 'Purple 50' },
        { value: 'bg-purple-100', label: 'Purple 100' },
        { value: 'bg-purple-500', label: 'Purple 500' },
        { value: 'bg-indigo-50', label: 'Indigo 50' },
        { value: 'bg-indigo-500', label: 'Indigo 500' },
        { value: 'bg-pink-50', label: 'Pink 50' },
        { value: 'bg-pink-500', label: 'Pink 500' },
        { value: 'bg-orange-50', label: 'Orange 50' },
        { value: 'bg-orange-500', label: 'Orange 500' }
    ];
  
    useEffect(() => {
      if (selectedElement && !isUpdating.current) {
        
        const newTextContent = selectedElement.textContent || '';
        const newClassName = selectedElement.className || '';
        
        // Parse current classes from className
        const currentClasses = newClassName.split(' ').filter(Boolean);
        
        // Initialize fontSize from element's className
        const currentFontSizeClass = currentClasses.find(cls => cls.startsWith('text-') && cls.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/));
        const newFontSize = currentFontSizeClass || 'text-base';

        // Initialize text color from element's className
        const currentTextColorClass = currentClasses.find(cls => 
          cls.startsWith('text-') && !cls.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/)
        );
        const newTextColor = currentTextColorClass || 'text-black';

        // Initialize background color from element's className
        const currentBgColorClass = currentClasses.find(cls => cls.startsWith('bg-'));
        const newBackgroundColor = currentBgColorClass || 'bg-transparent';
        
        // Initialize fontWeight from element's className
        const currentFontWeightClass = currentClasses.find(cls => 
          cls.startsWith('font-') && !cls.includes('family') && cls.match(/font-(thin|light|normal|medium|semibold|bold|black)$/)
        );
        const newFontWeight = currentFontWeightClass || 'font-normal';

        // Set font style from computed styles
        const newFontStyle = selectedElement.styles?.fontStyle || 'normal';
        
        // Determine font family from computed style or className
        const computedFontFamily = selectedElement.styles?.fontFamily || '';
        const fontFamilyClass = currentClasses.find(cls => 
          cls === 'font-mono' || cls === 'font-serif' || cls === 'font-sans'
        );
        
        let newFontFamily = 'sans';
        if (fontFamilyClass) {
          newFontFamily = fontFamilyClass.replace('font-', '');
        } else if (computedFontFamily.includes('monospace')) {
          newFontFamily = 'mono';
        } else if (computedFontFamily.includes('serif')) {
          newFontFamily = 'serif';
        }

        // Initialize padding from className
        const currentPaddingClass = currentClasses.find(cls => 
          cls.match(/^p[xytrbl]?-\d+$/)
        );
        const newPadding = currentPaddingClass || 'p-0';

        // Initialize margin from className
        const currentMarginClass = currentClasses.find(cls => 
          cls.match(/^m[xytrbl]?-\d+$/)
        );
        const newMargin = currentMarginClass || 'm-0';

        // Store current values as previous values BEFORE updating state
        previousValues.current = {
          textContent: textContent,
          className: className,
          fontSize: fontSize,
          textColor: textColor,
          backgroundColor: backgroundColor,
          fontWeight: fontWeight,
          fontStyle: fontStyle,
          fontFamily: fontFamily,
          padding: padding,
          margin: margin
        };
        
        setTextContent(newTextContent);
        setClassName(newClassName);
        setFontSize(newFontSize);
        setTextColor(newTextColor);
        setBackgroundColor(newBackgroundColor);
        setFontWeight(newFontWeight);
        setFontStyle(newFontStyle);
        setFontFamily(newFontFamily);
        setPadding(newPadding);
        setMargin(newMargin);
      }
    }, [selectedElement]);
  
    // Enhanced handleUpdate with change tracking
    const handleUpdate = (property, value, changeType = 'single') => {
      if (onUpdate && selectedElement && !isUpdating.current) {
        isUpdating.current = true;
        
        // Get the actual previous value from current state, not from ref
        let actualOldValue = '';
        switch(property) {
          case 'textContent': actualOldValue = textContent; break;
          case 'className': actualOldValue = className; break;
          case 'fontSize': actualOldValue = fontSize; break;
          case 'textColor': actualOldValue = textColor; break;
          case 'backgroundColor': actualOldValue = backgroundColor; break;
          case 'fontWeight': actualOldValue = fontWeight; break;
          case 'fontStyle': actualOldValue = fontStyle; break;
          case 'fontFamily': actualOldValue = fontFamily; break;
          case 'padding': actualOldValue = padding; break;
          case 'margin': actualOldValue = margin; break;
          default: actualOldValue = previousValues.current[property] || '';
        }
        
        // Determine what changed
        const changeInfo = {
          property,
          value,
          changeType,
          oldValue: actualOldValue,
          newValue: value
        };

        setTimeout(() => {
          // Send the update with change information
          onUpdate(property, value, changeInfo);
          
          // Update previous values for next change
          previousValues.current[property] = value;
          
          setTimeout(() => {
            isUpdating.current = false;
          }, 100);
        }, 10);
      }
    };

    const updateClassName = (newClasses) => {
      const oldClassName = className;
      setClassName(newClasses);
      
      // Create change info with actual old/new values
      const changeInfo = {
        property: 'className',
        value: newClasses,
        changeType: 'className_direct',
        oldValue: oldClassName,
        newValue: newClasses
      };
      
      handleUpdate('className', newClasses, 'className_direct');
    };

    const updateClassProperty = (property, newValue, oldValue) => {
      const currentClasses = className.split(' ').filter(Boolean);
      
      if (oldValue) {
        const oldIndex = currentClasses.indexOf(oldValue);
        if (oldIndex > -1) {
          currentClasses.splice(oldIndex, 1);
        }
      }
      
      // Remove any existing classes of the same type more comprehensively
      const filteredClasses = currentClasses.filter(cls => {
        if (property === 'fontSize') return !cls.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/);
        if (property === 'textColor') return !cls.startsWith('text-') || cls.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/);
        if (property === 'backgroundColor') return !cls.startsWith('bg-');
        if (property === 'fontWeight') return !cls.match(/^font-(normal|bold|semibold|light|medium|thin|black)$/);
        if (property === 'fontFamily') return !cls.match(/^font-(sans|serif|mono)$/);
        if (property === 'padding') return !cls.match(/^p[xytrbl]?-\d+$/);
        if (property === 'margin') return !cls.match(/^m[xytrbl]?-\d+$/);
        return true;
      });
      
      // Add new class
      if (newValue && newValue !== 'none' && newValue !== 'bg-transparent') {
        filteredClasses.push(newValue);

      }
      
      const newClassName = filteredClasses.join(' ');
      
      // Create detailed change info for class property changes
      const changeInfo = {
        property: 'className',
        value: newClassName,
        changeType: 'class_property',
        classProperty: property,
        oldClassValue: oldValue,
        newClassValue: newValue,
        oldClassName: className,
        newClassName: newClassName
      };
      
      setClassName(newClassName);
      handleUpdate('className', newClassName, 'class_property');
    };

    const handleTextChange = (value) => {
      const oldTextContent = textContent;
      setTextContent(value);
      
      // Clear any existing timeout to prevent multiple updates
      clearTimeout(window.textUpdateTimeout);
      
      // Debounce the update but ensure we pass the correct old value
      window.textUpdateTimeout = setTimeout(() => {
        const changeInfo = {
          property: 'textContent',
          value: value,
          changeType: 'text_content',
          oldValue: oldTextContent, // Use the captured old value
          newValue: value
        };
        
        
        // Use the enhanced handleUpdate with proper change info
        if (onUpdate && selectedElement && !isUpdating.current) {
          isUpdating.current = true;
          
          setTimeout(() => {
            onUpdate('textContent', value, changeInfo);
            previousValues.current['textContent'] = value;
            
            setTimeout(() => {
              isUpdating.current = false;
            }, 100);
          }, 10);
        }
      }, 5); // Increased debounce time to 500ms for better UX
    };
  
    if (!selectedElement) {
      return (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-center text-gray-400">
            <Edit3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Select an element to edit its properties</p>
            <p className="text-sm mt-2">Click on any element in the preview to start editing</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="space-y-4">
        <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
          <div className="font-medium text-blue-200">Selected: {selectedElement.tagName}</div>
          <div className="text-sm text-blue-300">Selector: {selectedElement.selector}</div>
          {selectedElement.id && (
            <div className="text-xs text-blue-400">ID: #{selectedElement.id}</div>
          )}
          <div className="text-xs text-gray-400 mt-1">Current className: {className}</div>
        </div>
  
        {/* Text Content */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-200">
            <Type className="w-4 h-4" />
            Text Content
          </label>
          <textarea
            value={textContent}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md resize-none text-gray-100 focus:border-blue-500 focus:outline-none"
            rows="3"
            placeholder="Enter text content..."
          />
        </div>

        {/* Class Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-200">
            <Code className="w-4 h-4" />
            Tailwind Classes (className)
          </label>
          <input
            type="text"
            value={className}
            onChange={(e) => updateClassName(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100 focus:border-blue-500 focus:outline-none"
            placeholder="e.g., flex items-center bg-blue-500"
          />
        </div>
  
        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-200">
              <Palette className="w-4 h-4" />
              Text Color
            </label>
            <Select
              value={textColor}
              onValueChange={(value) => {
                const oldTextColor = textColor;
                setTextColor(value);
                updateClassProperty('textColor', value, oldTextColor);
              }}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-100">
                <SelectValue placeholder="Select text color" />
              </SelectTrigger>
              <SelectContent>
                {textColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${color.value.replace('text-', 'bg-')} border`}></div>
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">Background Color</label>
            <Select
              value={backgroundColor}
              onValueChange={(value) => {
                const oldBackgroundColor = backgroundColor;
                setBackgroundColor(value);
                updateClassProperty('backgroundColor', value, oldBackgroundColor);
              }}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-100">
                <SelectValue placeholder="Select background color" />
              </SelectTrigger>
              <SelectContent>
                {backgroundColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${color.value} border ${color.value === 'bg-transparent' ? 'bg-gray-200' : ''}`}></div>
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">Typography</label>
          <Select
            value={fontFamily}
            onValueChange={(value) => {
              const oldFontFamily = `font-${fontFamily}`;
              const newFontFamily = `font-${value}`;
              setFontFamily(value);
              updateClassProperty('fontFamily', newFontFamily, oldFontFamily);
            }}
          >
            <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-100">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sans">Sans-serif</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="mono">Monospace</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Font Weight and Font Size */}
        <div className="flex gap-2">
          <Select
            value={fontWeight}
            onValueChange={(value) => {
              const oldWeight = fontWeight;
              setFontWeight(value);
              updateClassProperty('fontWeight', value, oldWeight);
            }}
          >
            <SelectTrigger className="w-1/2 bg-gray-800 border-gray-600 text-gray-100">
              <SelectValue placeholder="Weight" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="font-thin">Thin</SelectItem>
              <SelectItem value="font-light">Light</SelectItem>
              <SelectItem value="font-normal">Normal</SelectItem>
              <SelectItem value="font-medium">Medium</SelectItem>
              <SelectItem value="font-semibold">Semibold</SelectItem>
              <SelectItem value="font-bold">Bold</SelectItem>
              <SelectItem value="font-black">Black</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={fontSize}
            onValueChange={(value) => {
              const oldSize = fontSize;
              setFontSize(value);
              updateClassProperty('fontSize', value, oldSize);
            }}
          >
            <SelectTrigger className="w-1/2 bg-gray-800 border-gray-600 text-gray-100">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text-xs">12px (xs)</SelectItem>
              <SelectItem value="text-sm">14px (sm)</SelectItem>
              <SelectItem value="text-base">16px (base)</SelectItem>
              <SelectItem value="text-lg">18px (lg)</SelectItem>
              <SelectItem value="text-xl">20px (xl)</SelectItem>
              <SelectItem value="text-2xl">24px (2xl)</SelectItem>
              <SelectItem value="text-3xl">30px (3xl)</SelectItem>
              <SelectItem value="text-4xl">36px (4xl)</SelectItem>
              <SelectItem value="text-5xl">48px (5xl)</SelectItem>
              <SelectItem value="text-6xl">60px (6xl)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Padding and Margin */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">Padding</label>
            <Select
              value={padding}
              onValueChange={(value) => {
                const oldPadding = padding;
                setPadding(value);
                updateClassProperty('padding', value, oldPadding);
              }}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-100">
                <SelectValue placeholder="Padding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p-0">0</SelectItem>
                <SelectItem value="p-1">4px</SelectItem>
                <SelectItem value="p-2">8px</SelectItem>
                <SelectItem value="p-3">12px</SelectItem>
                <SelectItem value="p-4">16px</SelectItem>
                <SelectItem value="p-5">20px</SelectItem>
                <SelectItem value="p-6">24px</SelectItem>
                <SelectItem value="p-8">32px</SelectItem>
                <SelectItem value="p-10">40px</SelectItem>
                <SelectItem value="p-12">48px</SelectItem>
                <SelectItem value="p-16">64px</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-200">Margin</label>
            <Select
              value={margin}
              onValueChange={(value) => {
                const oldMargin = margin;
                setMargin(value);
                updateClassProperty('margin', value, oldMargin);
              }}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-100">
                <SelectValue placeholder="Margin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m-0">0</SelectItem>
                <SelectItem value="m-1">4px</SelectItem>
                <SelectItem value="m-2">8px</SelectItem>
                <SelectItem value="m-3">12px</SelectItem>
                <SelectItem value="m-4">16px</SelectItem>
                <SelectItem value="m-5">20px</SelectItem>
                <SelectItem value="m-6">24px</SelectItem>
                <SelectItem value="m-8">32px</SelectItem>
                <SelectItem value="m-10">40px</SelectItem>
                <SelectItem value="m-12">48px</SelectItem>
                <SelectItem value="m-16">64px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
};

export default PropertyEditor;
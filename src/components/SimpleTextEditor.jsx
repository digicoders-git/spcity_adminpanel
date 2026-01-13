import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Quote,
  Link,
  Image,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow
} from 'lucide-react';

const SimpleTextEditor = ({ value, onChange, placeholder = "Start writing your content..." }) => {
  const [content, setContent] = useState(value || '');

  const handleChange = (newContent) => {
    setContent(newContent);
    onChange(newContent);
  };

  const insertText = (before, after = '') => {
    const textarea = document.getElementById('blog-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    handleChange(newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: <Heading1 className="w-4 h-4" />,
      title: 'Heading 1',
      action: () => insertText('# ', '\n')
    },
    {
      icon: <Heading2 className="w-4 h-4" />,
      title: 'Heading 2',
      action: () => insertText('## ', '\n')
    },
    {
      icon: <Heading3 className="w-4 h-4" />,
      title: 'Heading 3',
      action: () => insertText('### ', '\n')
    },
    { 
      icon: <Bold className="w-4 h-4" />, 
      title: 'Bold', 
      action: () => insertText('**', '**') 
    },
    { 
      icon: <Italic className="w-4 h-4" />, 
      title: 'Italic', 
      action: () => insertText('*', '*') 
    },
    { 
      icon: <Underline className="w-4 h-4" />, 
      title: 'Underline', 
      action: () => insertText('<u>', '</u>') 
    },
    { 
      icon: <List className="w-4 h-4" />, 
      title: 'Bullet List', 
      action: () => insertText('- ', '\n') 
    },
    { 
      icon: <ListOrdered className="w-4 h-4" />, 
      title: 'Numbered List', 
      action: () => insertText('1. ', '\n') 
    },
    { 
      icon: <Quote className="w-4 h-4" />, 
      title: 'Quote', 
      action: () => insertText('> ', '\n') 
    },
    { 
      icon: <Code className="w-4 h-4" />, 
      title: 'Code', 
      action: () => insertText('`', '`') 
    },
    { 
      icon: <Link className="w-4 h-4" />, 
      title: 'Link', 
      action: () => insertText('[', '](url)') 
    },
    { 
      icon: <Image className="w-4 h-4" />, 
      title: 'Image', 
      action: () => insertText('![', '](image-url)') 
    }
  ];

  const markdownGuide = [
    { syntax: '# Heading 1', description: 'Large heading' },
    { syntax: '## Heading 2', description: 'Medium heading' },
    { syntax: '**Bold**', description: 'Bold text' },
    { syntax: '*Italic*', description: 'Italic text' },
    { syntax: '- List item', description: 'Bullet list' },
    { syntax: '1. List item', description: 'Numbered list' },
    { syntax: '[Link](url)', description: 'Hyperlink' },
    { syntax: '![Image](url)', description: 'Insert image' },
    { syntax: '> Quote', description: 'Block quote' },
    { syntax: '`Code`', description: 'Inline code' }
  ];

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3 flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.action}
            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-white rounded-lg transition-all duration-200 border border-transparent hover:border-yellow-200"
            title={button.title}
          >
            {button.icon}
          </button>
        ))}
      </div>

      {/* Editor */}
      <textarea
        id="blog-editor"
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-96 p-4 resize-none focus:outline-none text-gray-700 font-mono text-sm"
      />

      {/* Markdown Guide */}
      <div className="bg-gray-50 border-t border-gray-300 p-4">
        <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
          <Pilcrow className="w-4 h-4 mr-2" />
          Markdown Guide
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {markdownGuide.map((item, index) => (
            <div key={index} className="bg-white p-2 rounded border border-gray-200">
              <code className="text-yellow-600 font-mono">{item.syntax}</code>
              <div className="text-gray-500 mt-1">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleTextEditor;
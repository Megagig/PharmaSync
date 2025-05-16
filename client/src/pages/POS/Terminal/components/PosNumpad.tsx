import React from 'react';
import Button from '@/components/common/Button/Button';

interface PosNumpadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
}

const PosNumpad = ({ value, onChange, onSubmit }: PosNumpadProps) => {
  const handleButtonClick = (digit: string) => {
    if (digit === 'clear') {
      onChange('');
    } else if (digit === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (digit === 'decimal') {
      if (!value.includes('.')) {
        onChange(value + '.');
      }
    } else {
      onChange(value + digit);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2" onKeyDown={handleKeyDown}>
      {/* First row */}
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('7')}
      >
        7
      </Button>
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('8')}
      >
        8
      </Button>
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('9')}
      >
        9
      </Button>

      {/* Second row */}
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('4')}
      >
        4
      </Button>
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('5')}
      >
        5
      </Button>
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('6')}
      >
        6
      </Button>

      {/* Third row */}
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('1')}
      >
        1
      </Button>
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('2')}
      >
        2
      </Button>
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('3')}
      >
        3
      </Button>

      {/* Fourth row */}
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('0')}
      >
        0
      </Button>
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('decimal')}
      >
        .
      </Button>
      <Button
        variant="outline"
        className="h-12 text-lg font-medium"
        onClick={() => handleButtonClick('backspace')}
      >
        ←
      </Button>

      {/* Fifth row */}
      <Button
        variant="outline"
        className="h-12 text-lg font-medium col-span-2"
        onClick={() => handleButtonClick('clear')}
      >
        Clear
      </Button>
      {onSubmit && (
        <Button
          variant="primary"
          className="h-12 text-lg font-medium"
          onClick={onSubmit}
        >
          Enter
        </Button>
      )}
    </div>
  );
};

export default PosNumpad;

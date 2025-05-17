import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '@/components/common/Card/Card';

const MessageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Message Detail</h1>
      </div>
      
      <Card>
        <div className="p-6">
          <p>Message ID: {id}</p>
          <p>This is a placeholder for the message detail page.</p>
        </div>
      </Card>
    </div>
  );
};

export default MessageDetail;

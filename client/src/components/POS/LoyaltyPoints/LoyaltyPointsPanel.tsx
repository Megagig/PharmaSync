import React, { useState, useEffect } from 'react';
import { CustomerLoyalty } from '@/types/loyalty.types';
import LoyaltyService from '@/services/loyalty.service';
import Card from '@/components/common/Card/Card';
import Button from '@/components/common/Button/Button';
import Input from '@/components/common/Input/Input';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

interface LoyaltyPointsPanelProps {
  customerId: string;
  onRedeemPoints: (points: number, value: number) => void;
  disabled?: boolean;
}

const LoyaltyPointsPanel: React.FC<LoyaltyPointsPanelProps> = ({
  customerId,
  onRedeemPoints,
  disabled = false,
}) => {
  const [loyaltyInfo, setLoyaltyInfo] = useState<CustomerLoyalty | null>(null);
  const [loading, setLoading] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [redeemValue, setRedeemValue] = useState<number>(0);
  const { showToast } = useToast();

  useEffect(() => {
    if (customerId && customerId !== 'walk-in-customer') {
      fetchLoyaltyInfo();
    } else {
      setLoyaltyInfo(null);
    }
  }, [customerId]);

  const fetchLoyaltyInfo = async () => {
    try {
      setLoading(true);
      const data = await LoyaltyService.getCustomerLoyalty(customerId);
      setLoyaltyInfo(data);
    } catch (error) {
      console.error('Error fetching loyalty info:', error);
      showToast('Failed to fetch loyalty information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const points = parseInt(e.target.value) || 0;
    setPointsToRedeem(points);
    
    // Calculate value based on loyalty program
    if (loyaltyInfo && loyaltyInfo.pointsValue) {
      const valuePerPoint = loyaltyInfo.pointsValue / loyaltyInfo.availablePoints;
      setRedeemValue(points * valuePerPoint);
    }
  };

  const handleRedeemPoints = () => {
    if (!loyaltyInfo) return;
    
    if (pointsToRedeem <= 0) {
      showToast('Please enter a valid number of points to redeem', 'error');
      return;
    }
    
    if (pointsToRedeem > loyaltyInfo.availablePoints) {
      showToast(`Customer only has ${loyaltyInfo.availablePoints} points available`, 'error');
      return;
    }
    
    onRedeemPoints(pointsToRedeem, redeemValue);
    
    // Reset after redemption
    setPointsToRedeem(0);
  };

  if (!customerId || customerId === 'walk-in-customer') {
    return (
      <Card className="mb-4">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">Loyalty Points</h3>
          <p className="text-gray-500">Select a customer to view loyalty points</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mb-4">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">Loyalty Points</h3>
          <p className="text-gray-500">Loading loyalty information...</p>
        </div>
      </Card>
    );
  }

  if (!loyaltyInfo) {
    return (
      <Card className="mb-4">
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">Loyalty Points</h3>
          <p className="text-gray-500">No loyalty information available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">Loyalty Points</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Available Points</p>
            <p className="text-xl font-bold">{loyaltyInfo.availablePoints}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Points Value</p>
            <p className="text-xl font-bold">{formatCurrency(loyaltyInfo.pointsValue || 0)}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500">Tier</p>
          <p className="font-medium">{loyaltyInfo.tier}</p>
          {loyaltyInfo.tierDetails && (
            <div className="mt-1">
              <p className="text-xs text-gray-500">
                {loyaltyInfo.tierDetails.pointsMultiplier > 1 
                  ? `Earns ${loyaltyInfo.tierDetails.pointsMultiplier}x points` 
                  : ''}
              </p>
              {loyaltyInfo.tierDetails.benefits && loyaltyInfo.tierDetails.benefits.length > 0 && (
                <ul className="text-xs text-gray-500 mt-1 list-disc list-inside">
                  {loyaltyInfo.tierDetails.benefits.slice(0, 2).map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Redeem Points</h4>
          <div className="flex space-x-2 mb-2">
            <Input
              type="number"
              value={pointsToRedeem || ''}
              onChange={handlePointsChange}
              placeholder="Points to redeem"
              min={0}
              max={loyaltyInfo.availablePoints}
              disabled={disabled}
            />
            <Button
              variant="primary"
              onClick={handleRedeemPoints}
              disabled={!pointsToRedeem || pointsToRedeem <= 0 || pointsToRedeem > loyaltyInfo.availablePoints || disabled}
            >
              Redeem
            </Button>
          </div>
          {pointsToRedeem > 0 && (
            <p className="text-sm text-gray-600">
              Value: {formatCurrency(redeemValue)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LoyaltyPointsPanel;

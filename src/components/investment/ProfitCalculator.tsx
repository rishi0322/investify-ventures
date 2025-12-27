import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Calendar, Coins } from 'lucide-react';

interface ProfitCalculatorProps {
  startupName?: string;
  valuation?: number;
  minInvestment?: number;
}

export function ProfitCalculator({ 
  startupName = 'Startup', 
  valuation = 10000000,
  minInvestment = 500 
}: ProfitCalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState(minInvestment);
  const [expectedGrowth, setExpectedGrowth] = useState([25]);
  const [holdingPeriod, setHoldingPeriod] = useState([3]);

  // Calculate equity percentage
  const equityPercentage = (investmentAmount / valuation) * 100;
  
  // Calculate shares (assuming 1M total shares)
  const totalShares = 1000000;
  const sharesAcquired = Math.floor((investmentAmount / valuation) * totalShares);
  
  // Calculate projected returns
  const growthMultiplier = Math.pow(1 + expectedGrowth[0] / 100, holdingPeriod[0]);
  const projectedValue = investmentAmount * growthMultiplier;
  const projectedProfit = projectedValue - investmentAmount;
  const projectedROI = ((projectedValue - investmentAmount) / investmentAmount) * 100;

  // Different scenarios
  const scenarios = [
    { name: 'Conservative', growth: 15 },
    { name: 'Moderate', growth: 25 },
    { name: 'Optimistic', growth: 40 },
    { name: 'Aggressive', growth: 60 },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Profit Calculator
        </CardTitle>
        <CardDescription>
          Estimate your potential returns for {startupName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Investment Amount */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Investment Amount
          </Label>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">₹</span>
            <Input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Math.max(minInvestment, parseInt(e.target.value) || 0))}
              min={minInvestment}
              className="text-lg font-semibold"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum investment: ₹{minInvestment.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Equity Display */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Equity Stake</p>
              <p className="text-2xl font-bold text-primary">{equityPercentage.toFixed(4)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shares</p>
              <p className="text-2xl font-bold">{sharesAcquired.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on valuation of ₹{(valuation / 10000000).toFixed(1)} Cr
          </p>
        </div>

        {/* Expected Annual Growth */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Expected Annual Growth: {expectedGrowth[0]}%
          </Label>
          <Slider
            value={expectedGrowth}
            onValueChange={setExpectedGrowth}
            min={5}
            max={100}
            step={5}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Holding Period */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Holding Period: {holdingPeriod[0]} years
          </Label>
          <Slider
            value={holdingPeriod}
            onValueChange={setHoldingPeriod}
            min={1}
            max={10}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 year</span>
            <span>10 years</span>
          </div>
        </div>

        {/* Projected Returns */}
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
          <h4 className="font-semibold mb-3">Projected Returns</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Future Value</p>
              <p className="text-2xl font-bold text-accent">
                ₹{projectedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profit</p>
              <p className="text-2xl font-bold text-accent">
                +₹{projectedProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              {projectedROI.toFixed(0)}% ROI over {holdingPeriod[0]} years
            </Badge>
          </div>
        </div>

        {/* Scenario Analysis */}
        <div>
          <h4 className="font-semibold mb-3">Scenario Analysis ({holdingPeriod[0]} years)</h4>
          <div className="grid grid-cols-2 gap-2">
            {scenarios.map((scenario) => {
              const multiplier = Math.pow(1 + scenario.growth / 100, holdingPeriod[0]);
              const value = investmentAmount * multiplier;
              return (
                <div key={scenario.name} className="p-3 rounded-lg bg-secondary/50 border">
                  <p className="text-xs text-muted-foreground">{scenario.name} ({scenario.growth}%/yr)</p>
                  <p className="font-semibold">₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          * These are projections based on assumed growth rates. Actual returns may vary. Investing involves risk.
        </p>
      </CardContent>
    </Card>
  );
}
// hooks/useStorePricing.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useStorePricing = (store: string, ingredients: string[]) => {
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchPrices = async () => {
      const { data, error } = await supabase
        .from('store_prices')
        .select('ingredient_name, price_per_unit')
        .eq('store_name', store);

      if (data) {
        const priceMap: Record<string, number> = {};
        data.forEach(({ ingredient_name, price_per_unit }) => {
          priceMap[ingredient_name.toLowerCase()] = price_per_unit;
        });
        setPrices(priceMap);
      }
    };

    if (store && ingredients.length) fetchPrices();
  }, [store, ingredients]);

  return prices;
};

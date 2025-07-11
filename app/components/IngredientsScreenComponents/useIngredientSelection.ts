import { useState } from 'react';

export const useIngredientSelection = (initialList: string[]) => {
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());

  const handleToggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      newSet.has(ingredient) ? newSet.delete(ingredient) : newSet.add(ingredient);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allSelected = selectedIngredients.size === initialList.length;
    setSelectedIngredients(allSelected ? new Set() : new Set(initialList));
  };

  return {
    selectedIngredients,
    handleToggleIngredient,
    handleSelectAll,
  };
};

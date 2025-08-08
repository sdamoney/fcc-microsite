import React, { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

const initialSteps = [
  'Composable Commerce Setup',
  'Seller Onboarding',
  'Order & Warehouse Management',
  'Retail Media (Ads)',
  'Dynamic Pricing',
  'Personalization Engine',
];

const correctOrder = [...initialSteps];

function SortableItem({ id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-grab"
    >
      <div className="bg-white shadow p-4 text-blue-800 font-medium border-l-4 border-blue-600 mb-2">
        {id}
      </div>
    </motion.div>
  );
}

export default function FCCCardGame() {
  const [steps, setSteps] = useState([...shuffle(initialSteps)]);
  const [result, setResult] = useState(null);

  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function checkOrder() {
    const isCorrect = steps.every((step, i) => step === correctOrder[i]);
    setResult(isCorrect ? 'Correct Order! 🎉' : 'Try Again! ❌');
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = steps.indexOf(active.id);
      const newIndex = steps.indexOf(over.id);
      setSteps(arrayMove(steps, oldIndex, newIndex));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-blue-100 flex flex-col items-center justify-start px-4 py-8 font-sans">
      <img src="https://www.flipkartcommercecloud.com/static/media/fcc-logo.4b4a3e9b.svg" alt="FCC Logo" className="h-10 mb-6" />
      <h1 className="text-3xl font-bold mb-2 text-blue-900 text-center">Sort the Digital Commerce Journey</h1>
      <p className="mb-6 text-gray-700 text-center max-w-xl">
        Drag and arrange the steps in the correct order—from setup to personalization.
      </p>
      <div className="w-full max-w-md">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps} strategy={verticalListSortingStrategy}>
            {steps.map((step) => (
              <SortableItem key={step} id={step} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="mt-6 flex gap-4">
        <button onClick={checkOrder} className="bg-blue-600 text-white px-4 py-2 rounded shadow">Check Order</button>
        <button onClick={() => { setSteps(shuffle([...initialSteps])); setResult(null); }} className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded shadow">Shuffle</button>
      </div>
      {result && <p className="mt-4 text-lg font-semibold text-blue-700">{result}</p>}
      <footer className="mt-10 text-sm text-gray-500">Powered by Flipkart Commerce Cloud</footer>
    </div>
  );
}
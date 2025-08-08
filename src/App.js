import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const steps = [
  'Product Discovery',
  'Product Listing',
  'Checkout',
  'Payment',
  'Order Fulfillment',
  'Post-Sale Support'
];

function SortableItem(props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: 8,
    cursor: 'grab'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.id}
    </div>
  );
}

function App() {
  const [items, setItems] = useState(steps);

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: 50 }}>
      <h2>Arrange the Digital Commerce Journey</h2>
      <DndContext onDragEnd={({ active, over }) => {
        if (active.id !== over?.id) {
          setItems((items) => {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            return arrayMove(items, oldIndex, newIndex);
          });
        }
      }}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((step) => (
            <SortableItem key={step} id={step} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default App;
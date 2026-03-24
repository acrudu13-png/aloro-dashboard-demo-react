import { X } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

interface NodeWrapperProps {
  nodeId: string;
  selected: boolean;
  children: React.ReactNode;
}

export function NodeWrapper({ nodeId, selected, children }: NodeWrapperProps) {
  const { deleteElements, getNode } = useReactFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const node = getNode(nodeId);
    if (node) deleteElements({ nodes: [node] });
  };

  return (
    <div className="relative group">
      {/* Delete button — visible on hover or when selected */}
      <button
        onClick={handleDelete}
        className={`absolute -top-2.5 -right-2.5 z-10 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-sm transition-opacity ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        title="Delete node"
      >
        <X className="w-3 h-3" />
      </button>
      {children}
    </div>
  );
}

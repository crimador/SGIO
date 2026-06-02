'use client';

import {
  Card,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import type { FC } from 'react';
import { useCallback } from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position, useReactFlow } from 'reactflow';
import { CircleOff } from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

import type { EndConfigSchema } from './Config/EndConfigPanel';
import EndConfigPanel from './Config/EndConfigPanel';

interface DataProps {
  label: string;
  inputBoundId: string;
}

const EndTask: FC<NodeProps<DataProps>> = ({ data, id }) => {
  const { setNodes, getNode } = useReactFlow();

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((curNode) => curNode.id !== id));
  }, [id, setNodes]);

  const changeValues = useCallback(
    (value: EndConfigSchema) => {
      const currentNode = getNode(id);
      if (currentNode) {
        const newData = {
          ...currentNode.data,
          ...value,
        };
        setNodes((nodes) =>
          nodes.map((curNode) =>
            curNode.id == id
              ? {
                  ...curNode,
                  data: newData,
                }
              : curNode
          )
        );
      }
    },
    [getNode, id, setNodes]
  );

  return (
    <Card className="shadow-md">
      <Handle type="target" position={Position.Top} id={data.inputBoundId} />
      <CardHeader>
        <p className="flex gap-2 text-base font-bold" style={{ color: '#1E1D3D' }}>
          {data.label}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <CircleOff width="15" height="15" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {['ID', id].join(' : ')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
        <p className="text-sm text-gray-400">{'End'}</p>
      </CardHeader>
      <CardFooter>
        <EndConfigPanel
          id={id}
          initialValue={data}
          deleteNode={deleteNode}
          onSubmit={changeValues}
        />
      </CardFooter>
    </Card>
  );
};

export default EndTask;

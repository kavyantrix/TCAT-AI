import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { AwsIcons } from './AwsIcons';

interface AwsServiceNodeProps extends NodeProps {
  data: {
    label: string;
    serviceType: string;
  };
  selected: boolean;
}

const AwsServiceNode: React.FC<AwsServiceNodeProps> = ({ data, selected }) => {
  const Icon = AwsIcons[data.serviceType];

  return (
    <div className="aws-service-node">
      <NodeResizer 
        minWidth={100}
        minHeight={80}
        isVisible={selected}
        lineClassName="node-resize-line"
        handleClassName="node-resize-handle"
      />
      
      {/* Top handles */}
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="target" position={Position.Top} id="top-target" />
      
      {/* Right handles */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="right-source"
        style={{ top: '25%' }}
      />
      <Handle 
        type="target" 
        position={Position.Right} 
        id="right-target"
        style={{ top: '75%' }}
      />
      
      {/* Bottom handles */}
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
      
      {/* Left handles */}
      <Handle 
        type="source" 
        position={Position.Left} 
        id="left-source"
        style={{ top: '25%' }}
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="left-target"
        style={{ top: '75%' }}
      />
      
      <div className="node-content">
        {Icon && <Icon />}
        <div className="node-label">{data.label}</div>
      </div>
      
      <style jsx>{`
        .aws-service-node {
          padding: 10px;
          border-radius: 5px;
          background: white;
          border: 1px solid #ddd;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          height: 100%;
          min-width: 120px;
          min-height: 80px;
          position: relative;
        }
        .node-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          width: 100%;
          height: 100%;
          justify-content: center;
        }
        .node-label {
          font-size: 12px;
          text-align: center;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
};

export default memo(AwsServiceNode);
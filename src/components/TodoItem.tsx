import { Check, Clock, Trash2, ChevronDown, Edit3 } from 'lucide-react';
import { Todo } from '@/types/todo';
import clsx from 'clsx';
import { useState } from 'react';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onUpdatePriority: (priority: 'low' | 'medium' | 'high' | 'none') => void;
  onEdit: (title: string, description: string, priority: 'low' | 'medium' | 'high' | 'none') => void;
}

export default function TodoItem({ todo, onToggle, onDelete, onUpdatePriority, onEdit }: TodoItemProps) {
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState(todo.priority);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' },
  ];

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onEdit(editTitle, editDescription, editPriority);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
      <div className="flex items-start">
        <div 
          className={clsx(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 cursor-pointer",
            todo.completed 
              ? "bg-green-500 border-green-500" 
              : "border-gray-300"
          )}
          onClick={onToggle}
        >
          {todo.completed && <Check size={16} color="white" />}
        </div>
        
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full h-8 bg-gray-50 rounded px-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm font-semibold"
                placeholder="Task title"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full h-16 bg-gray-50 rounded px-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm resize-none"
                placeholder="Task description (optional)"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Priority:</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high' | 'none')}
                  className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">No Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className={clsx(
                "text-base font-semibold mb-1",
                todo.completed 
                  ? "line-through text-gray-500" 
                  : "text-gray-900"
              )}>
                {todo.title}
              </h3>
              {todo.description && (
                <p className={clsx(
                  "text-sm mb-2 leading-5",
                  todo.completed 
                    ? "line-through text-gray-400" 
                    : "text-gray-600"
                )}>
                  {todo.description}
                </p>
              )}
            </>
          )}
          
          <div className="flex items-center gap-3">
            {/* Priority Selector - Only show if priority is not 'none' */}
            {todo.priority !== 'none' && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPriorityDropdown(!showPriorityDropdown);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-white hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: getPriorityColor(todo.priority) }}
                >
                  {todo.priority.toUpperCase()}
                  <ChevronDown size={10} />
                </button>
                
                {showPriorityDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePriority('none');
                        setShowPriorityDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 rounded-t-lg flex items-center gap-2 text-gray-600"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      Remove Priority
                    </button>
                    {priorityOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdatePriority(option.value as 'low' | 'medium' | 'high' | 'none');
                          setShowPriorityDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 last:rounded-b-lg flex items-center gap-2 text-gray-900"
                      >
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Add Priority Button - Only show if no priority is set */}
            {todo.priority === 'none' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPriorityDropdown(!showPriorityDropdown);
                }}
                className="px-2 py-1 rounded-lg text-xs font-medium text-gray-500 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                + Add Priority
              </button>
            )}
            
            {/* Priority Dropdown for adding priority */}
            {todo.priority === 'none' && showPriorityDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdatePriority(option.value as 'low' | 'medium' | 'high' | 'none');
                      setShowPriorityDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 text-gray-900"
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            )}
            
            {todo.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock size={12} color="#6B7280" />
                <span className="text-xs text-gray-500">{todo.estimatedTime}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="ml-2 flex gap-1">
          {!isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Edit3 size={16} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

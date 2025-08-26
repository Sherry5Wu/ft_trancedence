import React, { useState, useRef, useEffect } from "react";
import { DropDownButtonProps } from "../utils/Interfaces";

export const DropDownButton: React.FC<DropDownButtonProps> = ({
	label,
	options,
	onSelect,
	className = "",
	disabled = false,
	selected,
	onToggle,
	}) => {
	
	const [isOpen, setIsOpen] = useState(false);
	const [internalSelected, setInternalSelected] = useState<string>("");
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (selected && selected !== internalSelected) {
			setInternalSelected(selected);
		}
	}, [selected]);

	const handleToggle = () => {
		if (!disabled)
		{
			setIsOpen((prev) => !prev);
			onToggle?.(!isOpen);
		}

	};

	const handleOptionClick = (value: string) => {
		setInternalSelected(value);
		onSelect(value);
		setIsOpen(false);
		onToggle?.(false);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
		if (
			wrapperRef.current &&
			!wrapperRef.current.contains(event.target as Node)
		) {
			setIsOpen(false);
			onToggle?.(false);
		}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const filled = !!selected;

	return (
		<div className='flex relative justify-center my-0.5' ref={wrapperRef}>
		<button
			type="button"
			className={`dropdown-button ${filled ? '' : 'text-black/50'} ${className}`}
			onClick={handleToggle}
			disabled={disabled}
		>
			<span className='grow text-left'>{internalSelected || label}</span>
			<span className='ml-auto'>{isOpen ? "▲" : "▼"}</span>
		</button>

		{isOpen && (
			<ul className="dropdown-menu">
			{options.map((opt, index) => (
				<li
				key={index}
				className={`dropdown-option ${
					internalSelected === opt ? "filled" : ""
				}`}
				onClick={() => handleOptionClick(opt)}
				>
				{opt}
				</li>
			))}
			</ul>
		)}
		</div>
	);
};
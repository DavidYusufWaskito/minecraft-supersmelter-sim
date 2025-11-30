"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

class furnaceObj {
	constructor(item, fuel, active = false, progress = 0, burnTime = 80) {
		this.item = item;
		this.fuel = fuel;
		this.active = active;
		this.progress = progress; // progress timer nya (max 10)
		this.burnTime = burnTime;
	}
}

export default function Home() {
	const [smeltedCount, setSmeltedCount] = useState(0);

	const [furnace, setFurnace] = useState(16);
	const [items, setItems] = useState(64);
	const [fuel, setFuel] = useState(16);

	//modifier

	// furnace durations in seconds
	const [furnaceDuration, setFurnaceDuration] = useState(10);
	const [furnaceBurnTime, setFurnaceBurnTime] = useState(furnaceDuration * 8);

	// const [furnaceTime, setFurnaceTime] = useState(0);

	// is it smelting or nah?
	const [isSmelting, setIsSmelting] = useState(false);

	// allocate furnaceObj to furnace count
	const [furnaces, setFurnaces] = useState(
		Array.from(
			{ length: furnace },
			() => new furnaceObj(0, 0, false, 0, furnaceBurnTime)
		)
	);


	const [editDuration, setEditDuration] = useState(furnaceDuration);
	const applySettings = () => {
		let _fuels = fuel;
		let _items = items;
		let _furnace = furnace;
		let _burnTime = furnaceBurnTime;
		// buat array kosong
		const newFurnaces = Array.from(
			{ length: _furnace },
			() => new furnaceObj(0, 0, false, 0, _burnTime)
		);

		// bagi fuel secara round robin
		for (let i = 0; i < _fuels; i++) {
			const idx = i % _furnace;
			newFurnaces[idx].fuel += 1;
		}

		// bagi items secara round robin
		for (let i = 0; i < _items; i++) {
			let idx = i % _furnace;
			if (_fuels < _furnace) {
				idx = i % _fuels;
			}
			// hanya masuk ketika ada fuel
			newFurnaces[idx].item += 1;
		}

		// update state sekali saja
		setFurnaces(newFurnaces);
		setFurnaceDuration(editDuration);
	};

	function resetFurnaces() {
		setFurnaces(
			Array.from(
				{ length: furnace },
				() => new furnaceObj(0, 0, false, 0, furnaceBurnTime)
			)
		);
	}

	function setFurnaceItem(i, val) {
		setFurnaces((prev) => {
			const copy = [...prev];
			copy[i] = {
				...copy[i],
				item: val,
			};
			return copy;
		});
	}

	function setFurnaceFuel(i, val) {
		setFurnaces((prev) => {
			const copy = [...prev];
			copy[i] = {
				...copy[i],
				fuel: val,
			};
			return copy;
		});
	}

	function setFurnaceActive(i, val) {
		setFurnaces((prev) => {
			const copy = [...prev];
			copy[i] = {
				...copy[i],
				active: val,
			};
			return copy;
		});
	}

	function setFurnaceProgress(i, val) {
		setFurnaces((prev) => {
			const copy = [...prev];
			copy[i] = {
				...copy[i],
				progress: val,
			};
			return copy;
		});
	}
	useEffect(() => {
		setFurnaceBurnTime(furnaceDuration * 8);
	}, [furnaceDuration]);
	// set furnace round-robin
	useEffect(() => {
		// buat array kosong
		const newFurnaces = Array.from(
			{ length: furnace },
			() => new furnaceObj(0, 0, false, 0, furnaceBurnTime)
		);

		// bagi fuel secara round robin
		for (let i = 0; i < fuel; i++) {
			const idx = i % furnace;
			newFurnaces[idx].fuel += 1;
		}

		// bagi items secara round robin
		for (let i = 0; i < items; i++) {
			let idx = i % furnace;
			if (fuel < furnace) {
				idx = i % fuel;
			}
			// hanya masuk ketika ada fuel
			newFurnaces[idx].item += 1;
		}

		// update state sekali saja
		setFurnaces(newFurnaces);
	}, []);

	useEffect(() => {
		if (!isSmelting) return;

		let smeltedCount = 0;
		// aktifkan semua furnace yang item > 0 dan fuel > 0
		setFurnaces((prev) =>
			prev.map((f) => ({
				...f,
				fuel: f.fuel > 0 ? f.fuel - 1 : 0,
				active: f.fuel > 0,
				progress: 0,
				burnTime: furnaceBurnTime,
			}))
		);
		const interval = setInterval(() => {
			setFurnaces((prev) => {
				const updated = prev.map((f) => {
					if (!f.active) return f;

					// 1. STOP jika fuel habis
					if (f.burnTime <= 0) {
						return {
							...f,
							fuel: f.fuel > 0 ? f.fuel - 1 : 0,
							burnTime: furnaceBurnTime,
							progress: 0,
							active: f.fuel > 0,
						};
					}

					// 2. Jika progress selesai smelting 1 item
					if (f.progress + 1 >= furnaceDuration) {
						smeltedCount += 1;
						return {
							...f,
							item: f.item - 1,
							progress: 0,
							burnTime: f.burnTime - 1,
							active: f.item - 1 > 0,
						};
					}
					// if (f.fuel <= 0) {
					// 	return {
					// 		...f,
					// 		active: false,
					// 		progress: 0,
					// 	};
					// }
					// 3. Default
					return {
						...f,
						progress: f.progress + 1,
						burnTime: f.burnTime - 1,
						// ketika b
					};
				});

				// setelah update → CEK semua furnace mati
				const allDead = updated.every((f) => !f.active);

				if (allDead) {
					// matikan smelting
					setIsSmelting(false);

					// update smeltedCount
					setSmeltedCount(smeltedCount);
				}

				return updated;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isSmelting, furnaceDuration]);

	return (
		<div className="flex">
			<div className="p-4 bg-gray-900 text-white rounded-lg w-64 space-y-4 shadow-lg">
				<h2 className="text-lg font-semibold">Furnace Settings</h2>

				<div className="flex flex-col gap-3">
					<label className="flex flex-col text-sm">
						Jumlah Furnace
						<input
							type="number"
							value={furnace}
							onChange={(e) => setFurnace(Number(e.target.value))}
							className="mt-1 p-2 rounded bg-gray-800 border border-gray-700"
						/>
					</label>

					<label className="flex flex-col text-sm">
						Jumlah Item
						<input
							type="number"
							value={items}
							onChange={(e) => setItems(Number(e.target.value))}
							className="mt-1 p-2 rounded bg-gray-800 border border-gray-700"
						/>
					</label>

					<label className="flex flex-col text-sm">
						Jumlah Fuel
						<input
							type="number"
							value={fuel}
							onChange={(e) => setFuel(Number(e.target.value))}
							className="mt-1 p-2 rounded bg-gray-800 border border-gray-700"
						/>
					</label>

					<label className="flex flex-col text-sm">
						Durasi Smelting (detik)
						<input
							type="number"
							value={editDuration}
							onChange={(e) => setEditDuration(Number(e.target.value))}
							className="mt-1 p-2 rounded bg-gray-800 border border-gray-700"
						/>
					</label>
				</div>

				<button
					className="w-full bg-green-600 hover:bg-green-700 p-2 rounded mt-2"
					onClick={applySettings}
				>
					Apply
				</button>
			</div>

			<div className="grid place-items-center w-full h-screen bg-gray-800">
				<div className="flex flex-wrap gap-3 mb-3">
					{furnaces.map((furnaceObj, index) => (
						<div
							key={index}
							className="relative pb-6 bg-white/30 border border-gray-300 rounded-lg shadow-lg backdrop-blur-sm"
						>
							<span className="absolute top-[-1] right-0 text-sm">
								{index + 1}
							</span>
							<div className="px-6 pt-6 mb-3">
								<span>{furnaceObj.item}</span>
								<hr />
								<span>{furnaceObj.fuel}</span>
							</div>

							{isSmelting && furnaceObj.active && (
								<div className="w-full h-1 bg-gray-200 rounded-full">
									<div
										className="h-full bg-green-500 rounded-full"
										style={{
											width: `${
												(furnaceObj.progress / furnaceDuration) * 100
											}%`,
										}}
									></div>

									<div
										className="h-full bg-red-500 rounded-full"
										style={{
											width: `${
												(furnaceObj.burnTime / furnaceBurnTime) * 100
											}%`,
										}}
									></div>
								</div>
							)}
						</div>
					))}
				</div>
				<div>
					{/* <span>Is smelting : {isSmelting ? "true" : "false"}</span>
					<span>Cooked item : {smeltedCount}</span> */}
					<div className="flex justify-center">
						{/* Tombol aktifkan smelting */}
						<button
							className="bg-gray-600 active:bg-gray-700 cursor-pointer p-3 rounded-lg"
							onClick={() => setIsSmelting(true)}
						>
							Run Furnace!
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

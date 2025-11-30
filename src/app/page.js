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
	const [items, setItems] = useState(128);
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

	// set furnace round-robin
	useEffect(() => {
		// buat array kosong
		const newFurnaces = Array.from(
			{ length: furnace },
			() => new furnaceObj(0, 0)
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
	}, [furnace, items, fuel]);

	useEffect(() => {
		if (!isSmelting) return;

    let smeltedCount = 0;
		// aktifkan semua furnace yang item > 0 dan fuel > 0
		setFurnaces((prev) =>
			prev.map((f) => ({
				...f,
				fuel: f.fuel > 0 ? f.fuel - 1 : 0,
				active: f.item > 0 && f.fuel > 0,
				progress: 0,
				burnTime: furnaceBurnTime,
			}))
		);
		const interval = setInterval(() => {
			setFurnaces((prev) => {
				const updated = prev.map((f) => {
					if (!f.active) return f;

					// 1. STOP jika burnTime habis
					if (f.burnTime <= 0) {
						return {
							...f,
							active: false,
							progress: 0,
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
							active: f.item - 1 > 0 && f.burnTime - 1 > 0,
						};
					}

					// 3. Default
					return {
						...f,
						progress: f.progress + 1,
						burnTime: f.burnTime - 1,
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
		<div className="grid place-items-center h-screen md:mx-80 bg-gray-800">
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
										width: `${(furnaceObj.progress / furnaceDuration) * 100}%`,
									}}
								></div>

								<div
									className="h-full bg-red-500 rounded-full"
									style={{
										width: `${(furnaceObj.burnTime / furnaceBurnTime) * 100}%`,
									}}
								></div>
							</div>
						)}
					</div>
				))}
			</div>
			<div>
				<span>Is smelting : {isSmelting ? "true" : "false"}</span>
				<span>Cooked item : {smeltedCount}</span>
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
	);
}

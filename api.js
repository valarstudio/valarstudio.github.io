const sheets_url = "https://script.google.com/macros/s/AKfycbyEkSY7FvTRugukqgXdbFTZWIMkAgYvDPtBwkE1A7pvLX2qK84YzV0h4nzL0FNS-kqb/exec";

document.addEventListener("DOMContentLoaded", () => {
	const userProfile = document.getElementById('userProfile');
	const loginLink = document.getElementById('loginLink');
	const pointsDisplay = document.getElementById('pointsDisplay');
	const usernameDisplay = document.getElementById('usernameDisplay');
	const currentUser = localStorage.getItem('valarUser');

	if (currentUser) {
		loginLink.style.display = 'none';
		userProfile.style.display = 'flex';
		pointsDisplay.textContent = "Cargando...";
		const cleanedUser = currentUser.replace(/^@/, "").toLowerCase().trim();
		fetch(`${sheets_url}?user=${encodeURIComponent(cleanedUser)}`)
			.then(response => {
				if (!response.ok) throw new Error("Error");
				return response.json();
			})
			.then(data => {
				if (data.success) {
					usernameDisplay.textContent = `@${data.username}`;
					pointsDisplay.textContent = `${data.points} Puntos`;
				} else {
					loginLink.style.display = 'block';
					userProfile.style.display = 'none';
					localStorage.removeItem('valarUser');
				}
			})
			.catch(error => {
				console.error("Error de red:", error);
				pointsDisplay.textContent = "Error de red";
			});

	} else {
		loginLink.style.display = 'block';
		userProfile.style.display = 'none';
	}
});
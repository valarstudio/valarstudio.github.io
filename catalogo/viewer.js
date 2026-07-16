document.addEventListener("DOMContentLoaded", () => {
	const canvas = document.getElementById('showcase');
	const app = new pc.Application(canvas, {
		mouse: new pc.Mouse(canvas),
		touch: new pc.TouchDevice(canvas),
		graphicsDeviceOptions: { alpha: true }
	});

	app.start();
	app.setCanvasFillMode(pc.FILLMODE_NONE);
	app.setCanvasResolution(pc.RESOLUTION_AUTO);
	window.addEventListener('resize', () => app.resizeCanvas());
	app.graphicsDevice.clearColor = new pc.Color(0, 0, 0, 0);

	//const cube = new pc.Entity('ElFuturoPeluche');
	//cube.addComponent('model', { type: 'box' });
	//app.root.addChild(cube);
	
	const splatObject = new pc.Entity('SplatModel');
	app.root.addChild(splatObject);
	app.assets.loadFromUrl('models/test.ply', 'gsplat', (err, asset) => {
		if (err) {
			console.error("Fallo crítico al cargar el Splat:", err);
			return;
		}
		splatObject.addComponent('gsplat', {
			asset: asset
		});
	});
	splatObject.rotate(180, 0, 0);

	const cameraPivot = new pc.Entity('CameraPivot');
    app.root.addChild(cameraPivot);

    // Creación de la cámara
    const camera = new pc.Entity('camera');
    camera.addComponent('camera', {
        clearColor: new pc.Color(0, 0, 0, 0),
        clearColorBuffer: true
    });
    
    // Guardamos la distancia actual en la posición local de la cámara (dentro del brazo del pivote)
    let currentZoom = 3;
    camera.setLocalPosition(0, 0, currentZoom);
    
    // ¡Aquí está la magia! Metemos la cámara dentro del pivote
	cameraPivot.addChild(camera);
	let isDragging = false;
	let lastTouchPoint = { x: 0, y: 0 };
	const rotationSpeed = 0.4;

	let yaw = 0;
	let pitch = 0;
	const minPitch = -45; // Límite para no ver el cactus totalmente desde abajo
	const maxPitch = 85;  // Límite para no dar la vuelta por arriba

    const minZoom = 1.2;
    const maxZoom = 6.0;
    let initialPinchDistance = 0;

    // Esta función rota el PIVOTE, lo que hace orbitar a la cámara de forma esférica perfecta
    function applyCameraOrbit() {
        if (pitch < minPitch) pitch = minPitch;
        if (pitch > maxPitch) pitch = maxPitch;

        // Rotamos el pivote usando el espacio GLOBAL para el Yaw (mantiene el horizonte vertical)
        // y el espacio LOCAL para el Pitch (para movernos de arriba a abajo de manera natural)
        cameraPivot.setEulerAngles(pitch, yaw, 0);
    }

    // --- Controles de PC (Mouse y Rueda) ---
    app.mouse.on(pc.EVENT_MOUSEDOWN, () => { isDragging = true; });
    app.mouse.on(pc.EVENT_MOUSEUP, () => { isDragging = false; });
    app.mouse.on(pc.EVENT_MOUSEMOVE, (e) => {
        if (isDragging) {
            yaw -= e.dx * rotationSpeed;
            pitch -= e.dy * rotationSpeed;
            applyCameraOrbit();
        }
    });

    app.mouse.on(pc.EVENT_MOUSEWHEEL, (e) => {
        currentZoom += e.wheelDelta * 0.3;
        if (currentZoom < minZoom) currentZoom = minZoom;
        if (currentZoom > maxZoom) currentZoom = maxZoom;
        
        // El zoom solo altera la distancia local de la cámara con respecto al pivote
        camera.setLocalPosition(0, 0, currentZoom);
        e.event.preventDefault();
    });

    // --- Controles de Móvil (Touch y Pinch) ---
    if (app.touch) {
        app.touch.on(pc.EVENT_TOUCHSTART, (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                lastTouchPoint = { x: e.touches[0].x, y: e.touches[0].y };
            } else if (e.touches.length === 2) {
                isDragging = false;
                let dx = e.touches[0].x - e.touches[1].x;
                let dy = e.touches[0].y - e.touches[1].y;
                initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
            }
            e.event.preventDefault();
        });
        
        app.touch.on(pc.EVENT_TOUCHEND, () => { isDragging = false; });
        
        app.touch.on(pc.EVENT_TOUCHMOVE, (e) => {
            if (e.touches.length === 1 && isDragging) {
                const currentTouch = e.touches[0];
                const dx = currentTouch.x - lastTouchPoint.x;
                const dy = currentTouch.y - lastTouchPoint.y;
                
                yaw -= dx * rotationSpeed;
                pitch -= dy * rotationSpeed;
                
                applyCameraOrbit();
                lastTouchPoint = { x: currentTouch.x, y: currentTouch.y };
                
            } else if (e.touches.length === 2) {
                let dx = e.touches[0].x - e.touches[1].x;
                let dy = e.touches[0].y - e.touches[1].y;
                let currentPinchDistance = Math.sqrt(dx * dx + dy * dy);
                let pinchDelta = initialPinchDistance - currentPinchDistance;
                
                currentZoom += pinchDelta * 0.01;
                if (currentZoom < minZoom) currentZoom = minZoom;
                if (currentZoom > maxZoom) currentZoom = maxZoom;
                
                camera.setLocalPosition(0, 0, currentZoom);
                initialPinchDistance = currentPinchDistance;
            }
            e.event.preventDefault();
        });
    }
});
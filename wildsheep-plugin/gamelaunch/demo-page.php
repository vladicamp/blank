<?php require_once __DIR__ . '/session-token.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Bamboonanza — Wild Sheep</title>
	<meta name="demo-token" content="<?php echo htmlspecialchars( $_SESSION['demo_token'] ); ?>">
</head>
<body>

	<div class="demo-frame" data-gameid="froggrog">
		<button class="demo-frame__play" data-gameid="froggrog">
			<span class="demo-frame__play-icon">▶</span>
			<span>PLAY DEMO</span>
		</button>
	</div>

	<script src="demo.js"></script>
</body>
</html>

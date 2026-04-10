import * as React from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Typography,
  Menu, Container, Avatar, Button, MenuItem
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';

const pages = ['Dues', 'Groups', 'Savings', 'Charts', 'Stocks'];

const theme = createTheme({
  palette: {
    purple: {
      main: '#8656cd',
    },
  },
});

function ResponsiveAppBar({ thememode, toggle, setUser, user, setFlag, flag }) {

  const navigate = useNavigate();

  // ✅ FIXED: moved inside component
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [navuser, setNavuser] = useState({});

  // ✅ user sync
  // ✅ Run only once on mount, don't put user._id in deps
useEffect(() => {
  try {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setNavuser(foundUser);
      // Only set if user isn't already loaded
      if (!user?._id) {
        setUser(foundUser);
      }
    }
  } catch (err) {
    console.error(err);
  }
}, [setUser, user?._id]); // ← empty deps, run once on mount only

  // -------- handlers ----------
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  function Logout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>

            {/* LOGO */}
            <img src="favicon.ico" alt="logo" style={{ height: "40px" }} />

            {/* TITLE (hidden on mobile) */}
            <Typography
              onClick={() => navigate("/dashboard")}
              sx={{
                ml: 1,
                fontWeight: 700,
                cursor: 'pointer',
                display: { xs: 'none', md: 'flex' },
                color: thememode === 'dark' ? 'white' : '#000080'
              }}
            >
              Paisa Vasooli
            </Typography>

            {/* 📱 MOBILE MENU */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton onClick={handleOpenNavMenu}>
                <MenuIcon sx={{ color: thememode === 'dark' ? 'white' : 'black' }} />
              </IconButton>

              <Menu
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page}
                    onClick={() => {
                      navigate(`/${page.toLowerCase()}`);
                      handleCloseNavMenu();
                    }}
                  >
                    {page}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* 💻 DESKTOP MENU */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={() => navigate(`/${page.toLowerCase()}`)}
                  sx={{
                    color: thememode === 'dark' ? 'white' : '#000080'
                  }}
                >
                  {page}
                </Button>
              ))}
            </Box>

            {/* RIGHT SIDE ICONS */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

              <LightModeIcon
                onClick={toggle}
                sx={{ cursor: 'pointer', color: thememode === 'dark' ? 'white' : 'black' }}
              />

              <MailOutlineIcon
                onClick={() => navigate("/inbox")}
                sx={{ cursor: 'pointer', color: thememode === 'dark' ? 'white' : 'black' }}
              />

              <IconButton onClick={handleOpenUserMenu}>
                <Avatar
                  alt={navuser?.name || "User"}
                  src={navuser?.image || 'ProfileImg.jpeg'}
                />
              </IconButton>

              {/* USER MENU */}
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
                <MenuItem onClick={() => navigate("/vault")}>Vault</MenuItem>
                <MenuItem onClick={Logout}>Logout</MenuItem>
              </Menu>

            </Box>

          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
}

export default ResponsiveAppBar;
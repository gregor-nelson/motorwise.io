#!/usr/bin/env python3
"""
DevEnvironmentGUI.py
A GUI application to start and monitor motorwise.io services using PyQt6.
With One Dark theme styling and enhanced terminal support.
"""

import os
import sys
import signal
import subprocess
import re
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QGridLayout, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QTextEdit, QGroupBox, QFrame, QScrollBar
)
from PyQt6.QtCore import Qt, QProcess, pyqtSlot, QTimer
from PyQt6.QtGui import QColor, QTextCursor, QFont, QTextCharFormat

# Configuration - Use relative paths from script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# Service configuration
SERVICES = {
    "dvla_api": {"name": "DVLA API", "dir": os.path.join(BACKEND_DIR, "dvla_api"), "cmd": "python", "args": ["app.py"]},
    "manual_api": {"name": "Manual API", "dir": os.path.join(BACKEND_DIR, "manual_api"), "cmd": "python", "args": ["app.py"]},
    "mot_api": {"name": "MOT API", "dir": os.path.join(BACKEND_DIR, "mot_api"), "cmd": "python", "args": ["main.py"]},
    "stripe_api": {"name": "Stripe API", "dir": os.path.join(BACKEND_DIR, "stripe_api"), "cmd": "python", "args": ["main.py"]},
    "frontend": {"name": "Frontend", "dir": FRONTEND_DIR, "cmd": "npm", "args": ["run", "dev"]},
    "auto_data_api": {"name": "Auto Data API", "dir": os.path.join(BACKEND_DIR, "auto_data_api"), "cmd": "python", "args": ["main.py"]},
    "claude_api": {"name": "Claude API", "dir": os.path.join(BACKEND_DIR, "claude_api"), "cmd": "python", "args": ["main.py"]},
    "tsb_api": {"name": "TSB API", "dir": os.path.join(BACKEND_DIR, "tsb_api"), "cmd": "python", "args": ["app.py"]}

}

# Enhanced One Dark Theme Colors - Matched with VSCode One Dark Theme
class OneDarkTheme:
    # UI Colors
    BACKGROUND = "#23272e"        # editor.background
    DARKER_BG = "#1e2227"         # sideBar.background/tab.inactiveBackground
    LIGHTER_BG = "#2c313c"        # editor.lineHighlightBackground
    BORDER = "#3e4452"            # panel.border
    SELECTION = "#67769660"       # editor.selectionBackground
    
    # Text Colors
    FOREGROUND = "#abb2bf"        # editor.foreground
    MUTED = "#5c6370"             # editorWhitespace.foreground
    BRIGHT_FG = "#d7dae0"         # activityBar.foreground
    
    # Button and UI Element Colors
    BUTTON_BG = "#404754"         # button.background
    BUTTON_SECONDARY_BG = "#30333d" # button.secondaryBackground
    BUTTON_HOVER = "#4d78cc"      # activityBarBadge.background
    
    # Syntax Colors
    BLUE = "#61afef"              # functions, methods
    GREEN = "#98c379"             # strings
    RED = "#e06c75"               # variables, tags
    ORANGE = "#d19a66"            # numbers, constants
    YELLOW = "#e5c07b"            # classes, types
    PURPLE = "#c678dd"            # keywords
    CYAN = "#56b6c2"              # operators
    
    # Terminal ANSI Colors
    TERM_BLACK = "#3f4451"        # terminal.ansiBlack
    TERM_RED = "#e05561"          # terminal.ansiRed
    TERM_GREEN = "#8cc265"        # terminal.ansiGreen
    TERM_YELLOW = "#d18f52"       # terminal.ansiYellow
    TERM_BLUE = "#4aa5f0"         # terminal.ansiBlue
    TERM_MAGENTA = "#c162de"      # terminal.ansiMagenta
    TERM_CYAN = "#42b3c2"         # terminal.ansiCyan
    TERM_WHITE = "#d7dae0"        # terminal.ansiWhite
    
    # Bright Terminal ANSI Colors
    TERM_BRIGHT_BLACK = "#4f5666"  # terminal.ansiBrightBlack
    TERM_BRIGHT_RED = "#ff616e"    # terminal.ansiBrightRed
    TERM_BRIGHT_GREEN = "#a5e075"  # terminal.ansiBrightGreen
    TERM_BRIGHT_YELLOW = "#f0a45d" # terminal.ansiBrightYellow
    TERM_BRIGHT_BLUE = "#4dc4ff"   # terminal.ansiBrightBlue
    TERM_BRIGHT_MAGENTA = "#de73ff" # terminal.ansiBrightMagenta
    TERM_BRIGHT_CYAN = "#4cd1e0"   # terminal.ansiBrightCyan
    TERM_BRIGHT_WHITE = "#e6e6e6"  # terminal.ansiBrightWhite


class TerminalEmulator:
    """A class that emulates terminal behavior for ANSI codes."""
    
    # ANSI escape sequence pattern
    ANSI_ESCAPE_PATTERN = re.compile(r'\x1b\[([\d;]*)([a-zA-Z])')
    
    # Standard 16 colors (0-15) in the format: normal, bright
    COLORS = [
        (QColor(OneDarkTheme.TERM_BLACK), QColor(OneDarkTheme.TERM_BRIGHT_BLACK)),      # Black
        (QColor(OneDarkTheme.TERM_RED), QColor(OneDarkTheme.TERM_BRIGHT_RED)),          # Red
        (QColor(OneDarkTheme.TERM_GREEN), QColor(OneDarkTheme.TERM_BRIGHT_GREEN)),      # Green
        (QColor(OneDarkTheme.TERM_YELLOW), QColor(OneDarkTheme.TERM_BRIGHT_YELLOW)),    # Yellow
        (QColor(OneDarkTheme.TERM_BLUE), QColor(OneDarkTheme.TERM_BRIGHT_BLUE)),        # Blue
        (QColor(OneDarkTheme.TERM_MAGENTA), QColor(OneDarkTheme.TERM_BRIGHT_MAGENTA)),  # Magenta
        (QColor(OneDarkTheme.TERM_CYAN), QColor(OneDarkTheme.TERM_BRIGHT_CYAN)),        # Cyan
        (QColor(OneDarkTheme.TERM_WHITE), QColor(OneDarkTheme.TERM_BRIGHT_WHITE)),      # White
    ]
    
    def __init__(self, text_edit):
        self.text_edit = text_edit
        self.current_format = QTextCharFormat()
        self.current_format.setForeground(QColor(OneDarkTheme.FOREGROUND))
        self.reset_state()
    
    def reset_state(self):
        """Reset terminal state to defaults."""
        self.current_format = QTextCharFormat()
        self.current_format.setForeground(QColor(OneDarkTheme.FOREGROUND))
        self.current_format.setBackground(QColor(OneDarkTheme.BACKGROUND))
    
    def process_sgr_code(self, code):
        """Process a Select Graphic Rendition (SGR) code."""
        if not code or code == '0':  # Reset all attributes
            self.reset_state()
            return
        
        codes = code.split(';')
        i = 0
        while i < len(codes):
            current_code = codes[i]
            
            # Handle empty code segments
            if not current_code:
                i += 1
                continue
                
            current_code = int(current_code)
            
            # Text formatting
            if current_code == 1:  # Bold
                self.current_format.setFontWeight(QFont.Weight.Bold)
            elif current_code == 2:  # Faint
                self.current_format.setFontWeight(QFont.Weight.Light)
            elif current_code == 3:  # Italic
                self.current_format.setFontItalic(True)
            elif current_code == 4:  # Underline
                self.current_format.setFontUnderline(True)
            elif current_code == 22:  # Normal weight
                self.current_format.setFontWeight(QFont.Weight.Normal)
            elif current_code == 23:  # Not italic
                self.current_format.setFontItalic(False)
            elif current_code == 24:  # Not underlined
                self.current_format.setFontUnderline(False)
            
            # Foreground color standard
            elif 30 <= current_code <= 37:
                color_index = current_code - 30
                self.current_format.setForeground(self.COLORS[color_index][0])
            
            # Background color standard
            elif 40 <= current_code <= 47:
                color_index = current_code - 40
                self.current_format.setBackground(self.COLORS[color_index][0])
                
            # Bright foreground colors
            elif 90 <= current_code <= 97:
                color_index = current_code - 90
                self.current_format.setForeground(self.COLORS[color_index][1])
                
            # Bright background colors
            elif 100 <= current_code <= 107:
                color_index = current_code - 100
                self.current_format.setBackground(self.COLORS[color_index][1])
                
            # 8-bit colors (256 colors)
            elif current_code == 38 or current_code == 48:
                if i + 2 < len(codes) and codes[i+1] == '5':  # 8-bit color
                    color_index = int(codes[i+2])
                    # Implement 8-bit color mapping (simplified version)
                    if color_index < 8:  # Standard colors
                        color = self.COLORS[color_index][0]
                    elif color_index < 16:  # Bright colors
                        color = self.COLORS[color_index-8][1]
                    elif color_index < 232:  # RGB color cube (approximation)
                        # Simplified RGB color cube calculation
                        color_index -= 16
                        r = (color_index // 36) * 51
                        g = ((color_index % 36) // 6) * 51
                        b = (color_index % 6) * 51
                        color = QColor(r, g, b)
                    else:  # Grayscale
                        # Simplified grayscale calculation
                        gray = (color_index - 232) * 10 + 8
                        color = QColor(gray, gray, gray)
                    
                    if current_code == 38:
                        self.current_format.setForeground(color)
                    else:
                        self.current_format.setBackground(color)
                    i += 2  # Skip the next two parameters
                
                # 24-bit true color
                elif i + 4 < len(codes) and codes[i+1] == '2':
                    r = int(codes[i+2])
                    g = int(codes[i+3])
                    b = int(codes[i+4])
                    color = QColor(r, g, b)
                    
                    if current_code == 38:
                        self.current_format.setForeground(color)
                    else:
                        self.current_format.setBackground(color)
                    i += 4  # Skip the next four parameters
            
            # Default foreground color
            elif current_code == 39:
                self.current_format.setForeground(QColor(OneDarkTheme.FOREGROUND))
            
            # Default background color
            elif current_code == 49:
                self.current_format.setBackground(QColor(OneDarkTheme.BACKGROUND))
            
            i += 1
    
    def process_text(self, text):
        """Process text with ANSI escape sequences and render it."""
        cursor = self.text_edit.textCursor()
        
        # Find all escape sequences
        last_end = 0
        for match in self.ANSI_ESCAPE_PATTERN.finditer(text):
            # Process any text before this escape sequence
            if match.start() > last_end:
                plain_text = text[last_end:match.start()]
                cursor.insertText(plain_text, self.current_format)
            
            # Process the escape sequence
            command = match.group(2)
            if command == 'm':  # SGR (Select Graphic Rendition)
                self.process_sgr_code(match.group(1))
            # Other ANSI commands could be handled here
            
            last_end = match.end()
        
        # Process any remaining text
        if last_end < len(text):
            plain_text = text[last_end:]
            cursor.insertText(plain_text, self.current_format)


def find_npm_path():
    """Find the full path to npm using PowerShell if on Windows."""
    # On non-Windows systems, use the traditional approach
    if os.name != "nt":
        try:
            result = subprocess.run(["which", "npm"], 
                                  capture_output=True, 
                                  text=True, 
                                  check=True)
            return result.stdout.strip()
        except:
            return "npm"
    
    # On Windows, try using PowerShell to get the proper path
    try:
        # Use PowerShell's Get-Command to find npm
        ps_command = "Get-Command npm | Select-Object -ExpandProperty Source"
        result = subprocess.run(
            ["powershell", "-Command", ps_command],
            capture_output=True,
            text=True,
            check=True
        )
        path = result.stdout.strip()
        if path and os.path.exists(path):
            return path
    except Exception as e:
        print(f"PowerShell detection failed: {e}")
    
    # Fallback to traditional methods if PowerShell approach fails
    try:
        # Try 'where' command 
        result = subprocess.run(["where", "npm"], 
                              capture_output=True, 
                              text=True, 
                              check=True)
        paths = result.stdout.strip().split('\n')
        if paths:
            return paths[0]  # Return the first found path
    except:
        # Check common locations as a last resort
        common_paths = [
            os.path.join("C:\\Program Files\\nodejs", "npm.cmd"),
            os.path.join("C:\\Program Files\\nodejs", "npm.ps1"),
            os.path.join(os.environ.get("ProgramFiles", ""), "nodejs", "npm.cmd"),
            os.path.join(os.environ.get("APPDATA", ""), "npm", "npm.cmd")
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                return path
    
    # If all else fails, just return the command name
    return "npm.cmd"


class CustomScrollBar(QScrollBar):
    """Custom styled scrollbar for the One Dark theme."""
    
    def __init__(self, orientation, parent=None):
        super().__init__(orientation, parent)
        
        # Apply One Dark theme
        self.setStyleSheet(f"""
            QScrollBar {{
                background: {OneDarkTheme.BACKGROUND};
                width: 12px;
                margin: 0;
            }}
            QScrollBar::handle {{
                background: {OneDarkTheme.MUTED};
                min-height: 30px;
                border-radius: 5px;
            }}
            QScrollBar::handle:hover {{
                background: {OneDarkTheme.BUTTON_BG};
            }}
            QScrollBar::add-line, QScrollBar::sub-line {{
                background: none;
                border: none;
            }}
            QScrollBar::add-page, QScrollBar::sub-page {{
                background: none;
            }}
        """)


class ServicePanel(QGroupBox):
    """A panel to control and display output for a single service."""
    
    def __init__(self, service_id, service_config, parent=None):
        super().__init__(service_config["name"], parent)
        self.service_id = service_id
        self.service_config = service_config
        self.process = None
        self.is_running = False
        
        # For frontend service, find npm path in advance
        if service_id == "frontend" and os.name == "nt":
            self.npm_path = find_npm_path()
        else:
            self.npm_path = None
        
        self.init_ui()
        
    def init_ui(self):
        """Initialize the UI components."""
        # Set panel styling with One Dark theme
        self.setStyleSheet(f"""
            QGroupBox {{
                font-weight: bold;
                font-size: 12px;
                border: 1px solid {OneDarkTheme.BORDER};
                border-radius: 5px;
                margin-top: 14px;
                padding-top: 10px;
                color: {OneDarkTheme.FOREGROUND};
                background-color: {OneDarkTheme.DARKER_BG};
            }}
            QGroupBox::title {{
                subcontrol-origin: margin;
                subcontrol-position: top center;
                padding: 0 5px;
                color: {OneDarkTheme.BLUE};
            }}
        """)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 15, 10, 10)
        layout.setSpacing(5)
        
        # Create text area for output
        self.output_text = QTextEdit()
        self.output_text.setReadOnly(True)
        self.output_text.setFont(QFont("Consolas", 9))
        self.output_text.setStyleSheet(f"""
            QTextEdit {{
                background-color: {OneDarkTheme.BACKGROUND}; 
                color: {OneDarkTheme.FOREGROUND};
                border: none;
                padding: 5px;
                border-radius: 4px;
            }}
        """)
        
        # Replace default scrollbars with custom themed ones
        v_scrollbar = CustomScrollBar(Qt.Orientation.Vertical, self.output_text)
        h_scrollbar = CustomScrollBar(Qt.Orientation.Horizontal, self.output_text)
        self.output_text.setVerticalScrollBar(v_scrollbar)
        self.output_text.setHorizontalScrollBar(h_scrollbar)
        
        self.output_text.setText("Service not started...")
        
        # Create terminal emulator for this output console
        self.terminal = TerminalEmulator(self.output_text)
        
        layout.addWidget(self.output_text)
        
        # Create control panel at the bottom
        control_panel = QFrame()
        control_panel.setStyleSheet(f"background-color: transparent; border: none;")
        control_layout = QHBoxLayout(control_panel)
        control_layout.setContentsMargins(0, 0, 0, 0)
        control_layout.setSpacing(8)
        
        # Create buttons
        self.start_button = QPushButton("Start")
        self.start_button.setFixedSize(70, 26)
        self.start_button.setStyleSheet(f"""
            QPushButton {{
                background-color: {OneDarkTheme.BUTTON_BG}; 
                color: {OneDarkTheme.FOREGROUND};
                border: none;
                border-radius: 4px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {OneDarkTheme.GREEN};
                color: {OneDarkTheme.BACKGROUND};
            }}
            QPushButton:pressed {{
                background-color: {OneDarkTheme.BUTTON_HOVER};
            }}
        """)
        
        self.stop_button = QPushButton("Stop")
        self.stop_button.setFixedSize(70, 26)
        self.stop_button.setStyleSheet(f"""
            QPushButton {{
                background-color: {OneDarkTheme.BUTTON_BG}; 
                color: {OneDarkTheme.FOREGROUND};
                border: none;
                border-radius: 4px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {OneDarkTheme.RED};
                color: {OneDarkTheme.BACKGROUND};
            }}
            QPushButton:pressed {{
                background-color: {OneDarkTheme.BUTTON_HOVER};
            }}
            QPushButton:disabled {{
                background-color: {OneDarkTheme.BUTTON_SECONDARY_BG};
                color: {OneDarkTheme.MUTED};
            }}
        """)
        self.stop_button.setEnabled(False)
        
        self.clear_button = QPushButton("Clear")
        self.clear_button.setFixedSize(70, 26)
        self.clear_button.setStyleSheet(f"""
            QPushButton {{
                background-color: {OneDarkTheme.BUTTON_BG}; 
                color: {OneDarkTheme.FOREGROUND};
                border: none;
                border-radius: 4px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {OneDarkTheme.BLUE};
                color: {OneDarkTheme.BACKGROUND};
            }}
            QPushButton:pressed {{
                background-color: {OneDarkTheme.BUTTON_HOVER};
            }}
        """)
        
        # Status label
        self.status_label = QLabel("Stopped")
        self.status_label.setStyleSheet(f"color: {OneDarkTheme.RED}; font-weight: bold;")
        
        # Connect signals
        self.start_button.clicked.connect(self.start_service)
        self.stop_button.clicked.connect(self.stop_service)
        self.clear_button.clicked.connect(self.clear_output)
        
        # Add components to layout
        control_layout.addWidget(self.start_button)
        control_layout.addWidget(self.stop_button)
        control_layout.addWidget(self.clear_button)
        control_layout.addWidget(self.status_label)
        control_layout.addStretch()
        
        layout.addWidget(control_panel)
    
    def start_service(self):
        """Start the service process."""
        if self.is_running:
            return
        
        # Clear output and update UI
        self.output_text.clear()
        self.append_output(f"Starting {self.service_config['name']}...\n")
        self.status_label.setText("Starting...")
        self.status_label.setStyleSheet(f"color: {OneDarkTheme.BLUE}; font-weight: bold;")
        self.start_button.setEnabled(False)
        self.stop_button.setEnabled(True)
        
        # Create QProcess
        self.process = QProcess()
        self.process.setWorkingDirectory(self.service_config["dir"])
        
        # Set environment with all current environment variables
        process_environment = self.process.processEnvironment()
        for key, value in os.environ.items():
            process_environment.insert(key, value)
        
        # Force unbuffered Python output
        process_environment.insert("PYTHONUNBUFFERED", "1")
        
        # For Node.js processes, ensure color output is enabled
        if self.service_id == "frontend":
            process_environment.insert("FORCE_COLOR", "true")
        
        self.process.setProcessEnvironment(process_environment)
        
        # Connect signals
        self.process.readyReadStandardOutput.connect(self.handle_stdout)
        self.process.readyReadStandardError.connect(self.handle_stderr)
        self.process.finished.connect(self.handle_finished)
        self.process.errorOccurred.connect(self.handle_error)
        
        # Special handling for npm on Windows using PowerShell
        if self.service_id == "frontend" and os.name == "nt":
            # Use PowerShell to launch npm for greater reliability
            self.process.setProgram("powershell")
            
            # Build command to run npm from its directory
            npm_path = self.npm_path
            npm_dir = os.path.dirname(npm_path)
            npm_name = os.path.basename(npm_path)
            
            # Log what we're doing
            self.append_output(f"Using PowerShell to launch npm from: {npm_path}\n")
            self.append_output(f"Working directory: {self.service_config['dir']}\n")
            
            # Create the arguments for PowerShell
            # This runs npm in the correct working directory
            ps_args = [
                "-NoProfile", 
                "-ExecutionPolicy", "Bypass",
                "-Command", 
                f"cd '{self.service_config['dir']}'; & '{npm_path}' run dev"
            ]
            
            # Start PowerShell with these arguments
            self.process.setArguments(ps_args)
        else:
            # Normal handling for other services
            self.process.setProgram(self.service_config["cmd"])
            self.process.setArguments(self.service_config["args"])
        
        # Start the process
        self.process.start()
        
        # Check if process started successfully
        if self.process.waitForStarted(3000):  # Wait up to 3 seconds
            self.is_running = True
            self.status_label.setText("Running")
            self.status_label.setStyleSheet(f"color: {OneDarkTheme.GREEN}; font-weight: bold;")
        else:
            self.handle_error(self.process.error())
    
    def stop_service(self):
        """Stop the service process."""
        if not self.is_running or self.process is None:
            return
        
        self.append_output("\nStopping service...\n")
        
        # Try to terminate gracefully first
        self.process.terminate()
        
        # Give it a moment to terminate
        QTimer.singleShot(2000, self.force_kill_if_needed)
    
    def force_kill_if_needed(self):
        """Kill the process if it didn't terminate gracefully."""
        if self.process is not None and self.process.state() != QProcess.ProcessState.NotRunning:
            self.process.kill()
    
    def handle_stdout(self):
        """Handle standard output from the process."""
        data = self.process.readAllStandardOutput().data().decode("utf-8", errors="replace")
        self.append_output(data)
    
    def handle_stderr(self):
        """Handle standard error from the process."""
        data = self.process.readAllStandardError().data().decode("utf-8", errors="replace")
        self.append_output(data, error=True)
    
    def handle_finished(self, exit_code, exit_status):
        """Handle process completion."""
        if not self.is_running:
            return
            
        self.is_running = False
        
        # Update UI
        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.status_label.setText("Stopped")
        self.status_label.setStyleSheet(f"color: {OneDarkTheme.RED}; font-weight: bold;")
        
        # Add exit message
        status_text = "Service has exited with code: " + str(exit_code)
        self.append_output(f"\n{status_text}\n")
    
    def handle_error(self, error):
        """Handle process errors."""
        error_messages = {
            QProcess.ProcessError.FailedToStart: "Process failed to start. Please check if the executable exists and if you have sufficient permissions.",
            QProcess.ProcessError.Crashed: "Process crashed.",
            QProcess.ProcessError.Timedout: "Process timed out.",
            QProcess.ProcessError.ReadError: "Error reading from the process.",
            QProcess.ProcessError.WriteError: "Error writing to the process.",
            QProcess.ProcessError.UnknownError: "Unknown process error."
        }
        
        error_msg = error_messages.get(error, f"Process error: {error}")
        self.append_output(f"\nERROR: {error_msg}\n", error=True)
        
        # Update UI when an error occurs
        self.is_running = False
        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.status_label.setText("Error")
        self.status_label.setStyleSheet(f"color: {OneDarkTheme.RED}; font-weight: bold;")
    
    def preprocess_vite_output(self, text):
        """Strip ANSI escape sequences from Vite output for cleaner display."""
        # Remove all ANSI escape sequences
        ansi_escape = re.compile(r'\x1b\[(?:\d+(?:;\d+)*)?[a-zA-Z]')
        return ansi_escape.sub('', text)
    
    def append_output(self, text, error=False):
        """Append text to the output display with improved formatting."""
        cursor = self.output_text.textCursor()
        cursor.movePosition(QTextCursor.MoveOperation.End)
        self.output_text.setTextCursor(cursor)
        
        if error:
            # For errors, always use theme's red color
            self.output_text.setTextColor(QColor(OneDarkTheme.RED))
            self.output_text.insertPlainText(text)
        else:
            # Check if this is Vite output
            if "[vite]" in text or "➜" in text:
                # For Vite output, strip ANSI codes and use simple formatting
                clean_text = self.preprocess_vite_output(text)
                
                if "warning:" in clean_text.lower():
                    self.output_text.setTextColor(QColor(OneDarkTheme.YELLOW))
                elif "error:" in clean_text.lower():
                    self.output_text.setTextColor(QColor(OneDarkTheme.RED))
                else:
                    self.output_text.setTextColor(QColor(OneDarkTheme.FOREGROUND))
                
                self.output_text.insertPlainText(clean_text)
            elif '\x1b[' in text:
                # Use the terminal emulator for other ANSI output
                self.terminal.process_text(text)
            else:
                # Plain text, use theme's default text color
                self.output_text.setTextColor(QColor(OneDarkTheme.FOREGROUND))
                self.output_text.insertPlainText(text)
        
        # Auto-scroll to the end
        self.output_text.verticalScrollBar().setValue(
            self.output_text.verticalScrollBar().maximum()
        )
    
    def clear_output(self):
        """Clear the output display."""
        self.output_text.clear()
        self.terminal.reset_state()


class MainWindow(QMainWindow):
    """Main application window."""
    
    def __init__(self):
        super().__init__()
        self.service_panels = {}
        self.init_ui()
    
    def init_ui(self):
        """Initialize the UI components."""
        self.setWindowTitle("motorwise.io Development Environment")
        self.setGeometry(100, 100, 1200, 800)
        
        # Apply One Dark theme to the main window
        self.setStyleSheet(f"""
            QMainWindow {{
                background-color: {OneDarkTheme.BACKGROUND};
                color: {OneDarkTheme.FOREGROUND};
            }}
            QWidget {{
                background-color: {OneDarkTheme.BACKGROUND};
                color: {OneDarkTheme.FOREGROUND};
            }}
        """)
        
        # Create central widget and main layout
        central_widget = QWidget()
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(15, 15, 15, 15)
        main_layout.setSpacing(15)
        
        # Create grid for service panels
        grid_layout = QGridLayout()
        grid_layout.setSpacing(15)
        
        # Create service panels and add to grid
        row, col = 0, 0
        for service_id, config in SERVICES.items():
            panel = ServicePanel(service_id, config)
            self.service_panels[service_id] = panel
            
            grid_layout.addWidget(panel, row, col)
            
            # Update row and column for grid layout
            col += 1
            if col >= 3:  # 3 columns per row
                col = 0
                row += 1
        
        main_layout.addLayout(grid_layout)
        
        # Create control buttons panel
        button_panel = QFrame()
        button_panel.setStyleSheet(f"""
            QFrame {{
                background-color: {OneDarkTheme.DARKER_BG};
                border-radius: 5px;
                border: 1px solid {OneDarkTheme.BORDER};
            }}
        """)
        button_panel.setFixedHeight(60)
        
        button_layout = QHBoxLayout(button_panel)
        button_layout.setContentsMargins(15, 5, 15, 5)
        button_layout.setSpacing(10)
        
        # Create control buttons with One Dark theme - FIXED VERSION
        start_all_button = QPushButton("Start All")
        start_all_button.setFixedSize(120, 36)
        start_all_button.setStyleSheet(f"""
            QPushButton {{
                background-color: {OneDarkTheme.BUTTON_BG}; 
                color: {OneDarkTheme.FOREGROUND};
                border: none;
                border-radius: 4px;
                font-weight: bold;
                padding: 8px 15px;
            }}
            QPushButton:hover {{
                background-color: {OneDarkTheme.GREEN};
                color: {OneDarkTheme.BACKGROUND};
            }}
            QPushButton:pressed {{
                background-color: {OneDarkTheme.BUTTON_HOVER};
            }}
        """)
        
        stop_all_button = QPushButton("Stop All")
        stop_all_button.setFixedSize(120, 36)
        stop_all_button.setStyleSheet(f"""
            QPushButton {{
                background-color: {OneDarkTheme.BUTTON_BG}; 
                color: {OneDarkTheme.FOREGROUND};
                border: none;
                border-radius: 4px;
                font-weight: bold;
                padding: 8px 15px;
            }}
            QPushButton:hover {{
                background-color: {OneDarkTheme.RED};
                color: {OneDarkTheme.BACKGROUND};
            }}
            QPushButton:pressed {{
                background-color: {OneDarkTheme.BUTTON_HOVER};
            }}
        """)
        
        clear_all_button = QPushButton("Clear All")
        clear_all_button.setFixedSize(120, 36)
        clear_all_button.setStyleSheet(f"""
            QPushButton {{
                background-color: {OneDarkTheme.BUTTON_BG}; 
                color: {OneDarkTheme.FOREGROUND};
                border: none;
                border-radius: 4px;
                font-weight: bold;
                padding: 8px 15px;
            }}
            QPushButton:hover {{
                background-color: {OneDarkTheme.BLUE};
                color: {OneDarkTheme.BACKGROUND};
            }}
            QPushButton:pressed {{
                background-color: {OneDarkTheme.BUTTON_HOVER};
            }}
        """)
        
        # Status label
        self.status_label = QLabel("Ready to start services")
        self.status_label.setStyleSheet(f"""
            font-weight: bold; 
            font-size: 14px;
            color: {OneDarkTheme.BRIGHT_FG};
            padding-left: 10px;
            border-left: 2px solid {OneDarkTheme.BLUE};
        """)
        
        # Connect signals
        start_all_button.clicked.connect(self.start_all_services)
        stop_all_button.clicked.connect(self.stop_all_services)
        clear_all_button.clicked.connect(self.clear_all_output)
        
        # Add components to layout
        button_layout.addWidget(start_all_button)
        button_layout.addWidget(stop_all_button)
        button_layout.addWidget(clear_all_button)
        button_layout.addWidget(self.status_label)
        button_layout.addStretch()
        
        main_layout.addWidget(button_panel)
        
        # Set central widget
        self.setCentralWidget(central_widget)
    
    def start_all_services(self):
        """Start all services."""
        self.status_label.setText("Starting all services...")
        self.status_label.setStyleSheet(f"""
            font-weight: bold; 
            font-size: 14px;
            color: {OneDarkTheme.BLUE};
            padding-left: 10px;
            border-left: 2px solid {OneDarkTheme.BLUE};
        """)
        
        # Start each service with a small delay
        for i, (service_id, panel) in enumerate(self.service_panels.items()):
            QTimer.singleShot(500 * i, panel.start_service)
        
        # Update status after all services started
        QTimer.singleShot(500 * len(self.service_panels), lambda: self.update_all_started_status())
    
    def update_all_started_status(self):
        """Update status after starting all services."""
        self.status_label.setText("All services started")
        self.status_label.setStyleSheet(f"""
            font-weight: bold; 
            font-size: 14px;
            color: {OneDarkTheme.GREEN};
            padding-left: 10px;
            border-left: 2px solid {OneDarkTheme.GREEN};
        """)
    
    def stop_all_services(self):
        """Stop all services."""
        self.status_label.setText("Stopping all services...")
        self.status_label.setStyleSheet(f"""
            font-weight: bold; 
            font-size: 14px;
            color: {OneDarkTheme.YELLOW};
            padding-left: 10px;
            border-left: 2px solid {OneDarkTheme.YELLOW};
        """)
        
        for panel in self.service_panels.values():
            panel.stop_service()
        
        # Update status after all services stopped
        QTimer.singleShot(2500, lambda: self.update_all_stopped_status())
    
    def update_all_stopped_status(self):
        """Update status after stopping all services."""
        self.status_label.setText("All services stopped")
        self.status_label.setStyleSheet(f"""
            font-weight: bold; 
            font-size: 14px;
            color: {OneDarkTheme.RED};
            padding-left: 10px;
            border-left: 2px solid {OneDarkTheme.RED};
        """)
    
    def clear_all_output(self):
        """Clear output for all services."""
        for panel in self.service_panels.values():
            panel.clear_output()
            
        self.status_label.setText("All outputs cleared")
        self.status_label.setStyleSheet(f"""
            font-weight: bold; 
            font-size: 14px;
            color: {OneDarkTheme.BRIGHT_FG};
            padding-left: 10px;
            border-left: 2px solid {OneDarkTheme.BLUE};
        """)
        
        # Reset status after a delay
        QTimer.singleShot(2000, lambda: self.reset_status())
    
    def reset_status(self):
        """Reset status label to default."""
        self.status_label.setText("Ready to start services")
        self.status_label.setStyleSheet(f"""
            font-weight: bold; 
            font-size: 14px;
            color: {OneDarkTheme.BRIGHT_FG};
            padding-left: 10px;
            border-left: 2px solid {OneDarkTheme.BLUE};
        """)
    
    def closeEvent(self, event):
        """Handle application close event."""
        # Stop all running services
        for panel in self.service_panels.values():
            if panel.is_running:
                panel.stop_service()
        
        # Give processes a moment to stop before closing
        QTimer.singleShot(1000, QApplication.quit)
        event.accept()


if __name__ == "__main__":
    # Enable Ctrl+C to terminate the application
    signal.signal(signal.SIGINT, signal.SIG_DFL)
    
    # Print npm path information to help with debugging
    if os.name == "nt":
        npm_path = find_npm_path()
        print(f"Found npm at: {npm_path}")
        
        # Test if we can actually run npm via PowerShell
        try:
            test_cmd = f"powershell -Command \"& '{npm_path}' --version\""
            print(f"Testing npm with: {test_cmd}")
            result = subprocess.run(test_cmd, shell=True, capture_output=True, text=True)
            print(f"npm test result: {result.stdout.strip()}")
            if result.returncode != 0:
                print(f"WARNING: npm test failed with error: {result.stderr.strip()}")
        except Exception as e:
            print(f"Error testing npm: {e}")
    
    app = QApplication(sys.argv)
    window = MainWindow()
    window.showMaximized()  # Launch in full screen

    sys.exit(app.exec())
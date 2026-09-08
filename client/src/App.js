import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Page components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Buildings from './pages/Buildings';
import Floors from './pages/Floors';
import FloorSides from './pages/FloorSides';
import LectureHalls from './pages/LectureHalls';
import Modules from './pages/Modules';
import Lecturers from './pages/Lecturers';
import LectureSessions from './pages/LectureSessions';
import DigitalDisplays from './pages/DigitalDisplays';
import Reports from './pages/Reports';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Unprotected Auth Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Admin Routes */}
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/buildings" element={<Buildings />} />
                                        <Route path="/floors" element={<Floors />} />
                                        <Route path="/floor-sides" element={<FloorSides />} />
                                        <Route path="/lecture-halls" element={<LectureHalls />} />
                                        <Route path="/modules" element={<Modules />} />
                                        <Route path="/lecturers" element={<Lecturers />} />
                                        <Route path="/lecture-sessions" element={<LectureSessions />} />
                                        <Route path="/digital-displays" element={<DigitalDisplays />} />
                                        <Route path="/reports" element={<Reports />} />
                                        {/* Catch-all redirect to Dashboard */}
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

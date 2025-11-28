import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Zap } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-white">
                            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                <Zap className="w-6 h-6" fill="currentColor" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter">
                                Snap<span className="text-orange-500">Repair</span>
                            </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            Instant AI diagnostics and expert repairs for your home appliances.
                            Fast, reliable, and professional service at your fingertips.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink icon={<Facebook className="w-5 h-5" />} href="#" />
                            <SocialLink icon={<Twitter className="w-5 h-5" />} href="#" />
                            <SocialLink icon={<Instagram className="w-5 h-5" />} href="#" />
                            <SocialLink icon={<Linkedin className="w-5 h-5" />} href="#" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <FooterLink href="#">Home</FooterLink>
                            <FooterLink href="#">How it Works</FooterLink>
                            <FooterLink href="#">Services</FooterLink>
                            <FooterLink href="#">Pricing</FooterLink>
                            <FooterLink href="#">Become an Expert</FooterLink>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Services</h3>
                        <ul className="space-y-4">
                            <FooterLink href="#">Appliance Repair</FooterLink>
                            <FooterLink href="#">Electrical Help</FooterLink>
                            <FooterLink href="#">Plumbing Issues</FooterLink>
                            <FooterLink href="#">HVAC Maintenance</FooterLink>
                            <FooterLink href="#">Smart Home Setup</FooterLink>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                                <span>123 Repair Street, Tech City, TC 90210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <span>support@snaprepair.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} SnapRepair. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-orange-500 transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ icon, href }: { icon: React.ReactNode; href: string }) {
    return (
        <a
            href={href}
            className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-orange-500 hover:text-white transition-all duration-300 hover:-translate-y-1"
        >
            {icon}
        </a>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <a
                href={href}
                className="text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-2 group"
            >
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                {children}
            </a>
        </li>
    );
}

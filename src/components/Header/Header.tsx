import * as React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import './Header.scss';
import Title from 'antd/lib/typography/Title';
import block from 'bem-cn';

const b = block('Header');

const Header: React.FC = () => {
    return (
        <div className="container">
            <div className={b()}>
                <nav className={b('nav')}>
                    <Link to={'/'}>
                        <div className={b('logo')}>
                            <span className="logo" />
                            <Title className={b('logo-title').toString()} level={4}>
                                RB Bonus
                            </Title>
                        </div>
                    </Link>
                    <ul className={b('menu')}>
                        <li className={b('menu-item')}>
                            <Button type="link">
                                <Link to="/">Домой</Link>
                            </Button>
                        </li>
                        <li className={b('menu-item')}>
                            <Button type="link">
                                <Link to="/tariffs">Тарифы</Link>
                            </Button>
                        </li>
                        <li className={b('menu-item')}>
                            <Button type="link">
                                <Link to="/strategies">Стратегии</Link>
                            </Button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default Header;

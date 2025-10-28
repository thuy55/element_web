/*
Copyright 2024 New Vector Ltd.
Copyright 2017 Marcel Radzio (MTRNord)
Copyright 2017 Vector Creations Ltd.

SPDX-License-Identifier: AGPL-3.0-only OR GPL-3.0-only OR LicenseRef-Element-Commercial
Please see LICENSE files in the repository root for full details.
*/

import React, { type ReactElement } from "react";
import classNames from "classnames";

import * as languageHandler from "../../../languageHandler";
import { _t } from "../../../languageHandler";
import Spinner from "./Spinner";
import Dropdown from "./Dropdown";
import { type NonEmptyArray } from "../../../@types/common";

type Languages = Awaited<ReturnType<typeof languageHandler.getAllLanguagesWithLabels>>;

function languageMatchesSearchQuery(query: string, language: Languages[0]): boolean {
    if (language.labelInTargetLanguage.toUpperCase().includes(query.toUpperCase())) return true;
    if (language.label.toUpperCase().includes(query.toUpperCase())) return true;
    if (language.value.toUpperCase() === query.toUpperCase()) return true;
    return false;
}

interface IProps {
    className?: string;
    onOptionChange: (language: string) => void;
    value: string;
    disabled?: boolean;
}

interface IState {
    searchQuery: string;
    langs: Languages | null;
}

export default class LanguageDropdown extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);

        this.state = {
            searchQuery: "",
            langs: null,
        };
    }

    public componentDidMount(): void {
        languageHandler
            .getAllLanguagesWithLabels()
            .then((langs) => {
                // Sắp xếp theo tên ngôn ngữ
                langs.sort((a, b) => {
                    if (a.labelInTargetLanguage < b.labelInTargetLanguage) return -1;
                    if (a.labelInTargetLanguage > b.labelInTargetLanguage) return 1;
                    return 0;
                });

                // ✅ Chỉ hiển thị English và Vietnamese
                langs = langs.filter(
                    (lang) => lang.value === "en" || lang.value === "vi"
                );

                this.setState({ langs });
            })
            .catch(() => {
                // Fallback nếu có lỗi khi load danh sách
                this.setState({
                    langs: [
                        {
                            value: "en",
                            label: "English",
                            labelInTargetLanguage: "English",
                        },
                        {
                            value: "vi",
                            label: "Vietnamese",
                            labelInTargetLanguage: "Tiếng Việt",
                        },
                    ],
                });
            });

        if (!this.props.value) {
            // Nếu không có giá trị ban đầu, chọn ngôn ngữ mặc định của user
            const language = languageHandler.getUserLanguage();
            this.props.onOptionChange(language);
        }
    }

    private onSearchChange = (search: string): void => {
        this.setState({ searchQuery: search });
    };

    public render(): React.ReactNode {
        if (this.state.langs === null) {
            return <Spinner />;
        }

        let displayedLanguages: Languages;
        if (this.state.searchQuery) {
            displayedLanguages = this.state.langs.filter((lang) =>
                languageMatchesSearchQuery(this.state.searchQuery, lang),
            );
        } else {
            displayedLanguages = this.state.langs;
        }

        const options = displayedLanguages.map((language) => (
            <div key={language.value}>{language.labelInTargetLanguage}</div>
        )) as NonEmptyArray<ReactElement & { key: string }>;

        return (
            <Dropdown
                id="mx_LanguageDropdown"
                className={classNames("mx_LanguageDropdown", this.props.className)}
                onOptionChange={this.props.onOptionChange}
                onSearchChange={this.onSearchChange}
                searchEnabled={true}
                value={this.props.value}
                label={_t("language_dropdown_label")}
                disabled={this.props.disabled}
            >
                {options}
            </Dropdown>
        );
    }
}

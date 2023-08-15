import React, { useState, useEffect, useContext } from 'react'
import styles from "./SearchPage.module.css"
import { useSearchParams } from 'react-router-dom'
import WidthLayout from '../../layouts/WidthLayout/WidthLayout'
import { Product } from '../../types/ProductType'
import { axios } from '../../services/api'
import SimpleProductCard from '../../components/ProductCards/SimpleProductCard/SimpleProductCard'
import ToggleSwitchCheckBox from '../../components/Checkboxes/ToggleSwitchCheckBox/ToggleSwitchCheckBox'
import SimpleCheckBox from '../../components/Checkboxes/SimpleCheckBox/SimpleCheckBox'
import StarRating from '../../components/Ratings/StarRating/StarRating'
import BarPagination from '../../components/Paginations/BarPagination/BarPagination'
import HeaderAndContentLayout from '../../layouts/HeaderAndContentLayout/HeaderAndContentLayout'
import { Category } from '../../types/CategoryType'
import { LoadingContext } from '../../contexts/LoadingContext'
import SimpleSelect from '../../components/Selects/SimpleSelect/SimpleSelect'
import { SelectType } from '../../types/SelectType'
import { useAddQueryParam } from '../../hooks/useAddQueryParam'

const SearchPage = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [currentPage, setCurrentPage] = useState<number>(0)
    const [totalPageCount, setTotalPageCount] = useState<number>(0)
    const [totalProductCount, setTotalProductCount] = useState(1)
    const [freeShipping, setFreeShipping] = useState<boolean>(false)
    const [searchParams] = useSearchParams()
    const [checkBoxValues, setCheckBoxValues] = useState<{ [key: string]: boolean }>({})
    const [categoriesData, setCategoriesData] = useState<Category[]>([])
    const { setIsLoading } = useContext(LoadingContext)
    const queryParam = searchParams.get('q')
    const addQueryParam = useAddQueryParam()
    
    const arrayFilters = Array.from(Array(2), (_, index) => index + 1)
    
    const itemsPerPageData = [
        {
            text: "20",
            value: 20
        },
        {
            text: "40",
            value: 40
        },
        {
            text: "60",
            value: 60
        },
    ]

    const filter1Data = [
        {
            text: "Mais relevantes",
            value: 0
        },
        {
            text: "Maior preço",
            value: 1
        },
        {
            text: "Menor preço",
            value: 2
        },
    ]
    
    const [itemsPerPage, setItemsPerPage] = useState<SelectType>(itemsPerPageData.find(item => String(item.value) === searchParams.get('limit')) || itemsPerPageData[0])
    const [filter1, setFilter1] = useState<SelectType>(filter1Data[0])

    const handleCheckboxChange = (id: string) => {
        setCheckBoxValues((prevState) => ({
            ...prevState,
            [id]: !prevState[id], // Inverte o valor do estado do checkbox
        }));
    };

    useEffect(() => {
        addQueryParam('limit', String(itemsPerPage.value))
        const get_products = async () => {
            setIsLoading(true)
            try {
                const offset = typeof itemsPerPage.value === "number" ? currentPage * itemsPerPage.value : 0
                const path = `/products/?search=${queryParam}&limit=${itemsPerPage?.value}&offset=${offset}`
                console.log(path)
                const response = await axios.get(path)
                if(response.status === 200){
                    setProducts(response.data.results)
                    setTotalPageCount(response.data.total_page_count)
                    setTotalProductCount(response.data.total_item_count)
                }
            } catch (error) {
                setTotalPageCount(0)
                setTotalProductCount(1)
                setProducts([])
            }
            setIsLoading(false)
        }
        get_products()
    }, [itemsPerPage, currentPage, queryParam, setIsLoading])

    useEffect(() => {
        const get_categories = async () => {
            setIsLoading(true)
            try {
                const response = await axios.get('/categories/?limit=1&random=true')
                if(response.status === 200){
                    setCategoriesData(response.data.results)
                }
            } catch (error) {
                setCategoriesData([])
            }
            setIsLoading(false)
        }
        get_categories()
    }, [setIsLoading])

    return (
        <WidthLayout width={90}>
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <span>{currentPage + 1}-{totalPageCount} de {totalProductCount} resultados para <span className={styles.searchText}>{queryParam}</span></span>
                        <SimpleSelect data={filter1Data} value={filter1} onChange={setFilter1} />
                    </div>
                    <div className={styles.body}>
                        <div className={`${styles.containerFilters} ${styles.filtersWrapper}`}>
                            <div className={styles.flexFilterD}>
                                <span>Frete grátis</span>
                                <ToggleSwitchCheckBox onChange={setFreeShipping} value={freeShipping} />
                            </div>
                            {arrayFilters.map((index) => {
                                return (
                                    <div className={styles.filtersWrapper} key={index}>
                                        <div className={styles.flexFilter}>
                                            <div className={styles.flexFilterHeader}>
                                                <h3 className={styles.flexFilterTitle}>Marcas</h3>
                                            </div>
                                            <div className={`${styles.flexFilterBody} ${styles.flexFilterBodyScroll}`}>
                                                {Array.from(Array(10)).map((_, index) => {
                                                    return (
                                                        <div className={styles.flexFilterItem} key={index} onClick={() => handleCheckboxChange(String(index))}>
                                                            <SimpleCheckBox value={checkBoxValues[String(index)]} />
                                                            <span className={styles.flexFilterDescription}>{`Iphone 12 (200)`}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            {index !== arrayFilters.length && (
                                                <div className={styles.flexFilterFooter}>
                                                    <div className={styles.flexFilterSeparator}></div>
                                                </div>
                                            )}
                                        </div>
                                        {index === 1 && (
                                            <div className={styles.flexFilter}>
                                                <div className={styles.flexFilterHeader}>
                                                    <h3 className={styles.flexFilterTitle}>Avaliações</h3>
                                                </div>
                                                <div className={styles.flexFilterBody}>
                                                    {Array.from(Array(4), (_, index) => index + 1).map((index) => (
                                                        <div className={styles.flexFilterItem} key={index}>
                                                            <StarRating rate={index} />
                                                            <span className={styles.flexFilterDescription}>e acima</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {index !== arrayFilters.length && (
                                                    <div className={styles.flexFilterFooter}>
                                                        <div className={styles.flexFilterSeparator}></div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        {products.length > 0 ? (
                            <div className={styles.containerProducts}>
                                <div className={styles.containerProductsBody}>
                                    {products.map((product) => (
                                        <SimpleProductCard 
                                            data={product} 
                                            key={product.id} 
                                            showDiscountPercentage={true} 
                                            showRating={true}
                                        />
                                    ))}
                                </div>
                                <div className={styles.containerProductsFooter}>
                                    <BarPagination 
                                        totalPageCount={totalPageCount} 
                                        currentPage={currentPage}
                                        onChange={setCurrentPage}
                                    />
                                    <div className={styles.containerProductsFooterItem}>
                                        <span>Itens por página</span>
                                        <SimpleSelect data={itemsPerPageData} value={itemsPerPage} onChange={setItemsPerPage} />
                                    </div>
                                </div>
                            </div>
                        ):(
                            <div className={styles.containerNotFound}>
                                <span>Nenhum produto encontrado!</span>
                            </div>
                        )}
                    </div>
                    <div className={styles.footer}>
                        {categoriesData[0] && categoriesData[0].products.length > 0 && (
                            <HeaderAndContentLayout title={categoriesData[0].name} href='/' enableScroll={true} autoScroll={true}>
                                {categoriesData[0].products.map((product) => (
                                    <SimpleProductCard key={product.id} data={product} showDiscountPercentage={true} showRating={true} />
                                ))}
                            </HeaderAndContentLayout>
                        )}
                    </div>
                </div>
            </div>
        </WidthLayout>
    )
}

export default SearchPage
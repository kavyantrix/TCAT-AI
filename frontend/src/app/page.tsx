import Image from 'next/image'
import styles from './page.module.css'
import CostChart from '../../components/CostChart'

export default function Home() {
  return (
    <main className={styles.main}>
      <CostChart costData={{
        dates: [],
        costs: []
      }} />
    </main>

  )
}
